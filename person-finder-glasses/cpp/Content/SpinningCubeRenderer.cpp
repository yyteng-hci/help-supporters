//*********************************************************
//
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

#include "pch.h"
#include "SpinningCubeRenderer.h"
#include "Common\DirectXHelper.h"
#include "AudioFileReader.h"
#include "XAudio2Helpers.h"
#include <iostream>

using namespace HolographicFaceTracker;
using namespace Concurrency;
using namespace DirectX;
using namespace Windows::Foundation::Numerics;

// Loads vertex and pixel shaders from files and instantiates the cube geometry.
SpinningCubeRenderer::SpinningCubeRenderer(std::shared_ptr<DX::DeviceResources> deviceResources) :
    DX::Resource(std::move(deviceResources))
{
   
    LPCWSTR file = L"Content/Sounds//MonoSound.wav";
    auto hr = m_audioFile.Initialize(file);
    
    Microsoft::WRL::ComPtr<IXAPO> xapo;
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered cube 1 ");
        // Passing in nullptr as the first arg for HrtfApoInit initializes the APO with defaults of
        // omnidirectional sound with natural distance decay behavior.
        // CreateHrtfApo will fail with E_NOTIMPL on unsupported platforms.
        hr = CreateHrtfApo(nullptr, &xapo);
    }

    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered cube 2 ");
        hr = xapo.As(&m_hrtfParams);
    }
    
    // Set the default environment.
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered cube 3 ");
        hr = m_hrtfParams->SetEnvironment(m_environment);
    }
    
    // Initialize an XAudio2 graph that hosts the HRTF xAPO.
    // The source voice is used to submit audio data and control playback.
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered cube 4 ");
        hr = SetupXAudio2(m_audioFile.GetFormat(), xapo.Get(), &m_xaudio2, &m_sourceVoice);
    }

    // Submit audio data to the source voice.
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered cube 5 ");
        XAUDIO2_BUFFER buffer{};
        buffer.AudioBytes = static_cast<UINT32>(m_audioFile.GetSize());
        buffer.pAudioData = m_audioFile.GetData();
        buffer.LoopCount = XAUDIO2_LOOP_INFINITE;
        hr = m_sourceVoice->SubmitSourceBuffer(&buffer);
        m_sourceVoice->SetVolume(8);
       
    }

    
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered cube 6 ");

        hr = CreateNearbyAudio();
    }
    
    if (SUCCEEDED(hr))
        OutputDebugStringA(" CREATED NEARBY AUDIO ");



}

// Called once per frame. Rotates the cube, and calculates and sets the model matrix
// relative to the position transform indicated by hologramPositionTransform.
void SpinningCubeRenderer::Update(const DX::StepTimer& timer)
{
    float const deltaTime = static_cast<float>(timer.GetElapsedSeconds());
    float const lerpDeltaTime = deltaTime * c_lerpRate;
    float3 const prevPosition = m_position;
    if (m_targetPosition.z < 0)
    {
        OutputDebugStringA(" ***NEGATIVE TARGET*** ");
        OutputDebugStringA(std::to_string(m_targetPosition.z).c_str());
        OutputDebugStringA(" ***NEGATIVE TARGET*** ");
    }
    
    m_targetPosition = {std::abs(m_targetPosition.x),std::abs(m_targetPosition.y),std::abs(m_targetPosition.z)};
    m_position = lerp(m_position, m_targetPosition, lerpDeltaTime);
    HrtfPosition pos = {m_position.x,m_position.y,m_position.z};
    m_hrtfParams->SetSourcePosition(&pos);

    m_velocity = (prevPosition - m_position) / deltaTime;
   
    if (m_sourceVoice != nullptr)
    {
        float bound = FindNearbyBound(m_targetPosition);
        OutputDebugStringA(std::to_string(m_position.z).c_str());
        //if (m_position.z < 0.5f && m_position.z > 0)
            //OutputDebugStringA(" ***NEARBY AUDIO SHOULD PLAY*** ");
        
        if ( m_nearbyVoice != nullptr && m_position.z < bound && std::abs(m_position.z > 0.f))
        {
            if (prevPosition.z > m_position.z) 
            {
                if (prevPosition.z >= bound) 
                {
                    OutputDebugStringA(" ***STARTED NEARBY AUDIO*** ");
                    
                    auto hr = m_sourceVoice->Stop();
                    hr = m_nearbyVoice->Start();

                    XAUDIO2_BUFFER buffer{};
                    buffer.AudioBytes = static_cast<UINT32>(m_nearbyFile.GetSize());
                    buffer.pAudioData = m_nearbyFile.GetData();
                    buffer.LoopCount = 0;
                    hr = m_nearbyVoice->SubmitSourceBuffer(&buffer);
                    
                }
            }
        }
        else if (m_velocity != 0.f && m_position.z >= bound)
        {
            auto hr = m_sourceVoice->Start();
            hr = m_nearbyVoice->Stop();
            //OutputDebugStringA(" **STARTED AUDIO** ");
        }
        else
            auto hr = m_sourceVoice->Stop();
    }

    // Rotate the cube.
    // Convert degrees to radians, then convert seconds to rotation angle.
    float const radiansPerSecond = XMConvertToRadians(m_degreesPerSecond);
    float const totalRotation    = static_cast<float>(timer.GetTotalSeconds()) * radiansPerSecond;

    // Scale the cube down to 10cm
    float4x4 const modelScale = make_float4x4_scale({ 0.1f });
    float4x4 const modelRotation = make_float4x4_rotation_y(totalRotation);
    float4x4 const modelTranslation = make_float4x4_translation(m_position);

    m_modelConstantBufferData.model = modelScale * modelRotation * modelTranslation;

    // Use the D3D device context to update Direct3D device-based resources.
    const auto context = m_deviceResources->GetD3DDeviceContext();

    // Update the model transform buffer for the hologram.
    context->UpdateSubresource(
        m_modelConstantBuffer.Get(),
        0,
        nullptr,
        &m_modelConstantBufferData,
        0,
        0
        );
}

// Renders one frame using the vertex and pixel shaders.
// On devices that do not support the D3D11_FEATURE_D3D11_OPTIONS3::
// VPAndRTArrayIndexFromAnyShaderFeedingRasterizer optional feature,
// a pass-through geometry shader is also used to set the render
// target array index.
void SpinningCubeRenderer::Render()
{
    const auto context = m_deviceResources->GetD3DDeviceContext();

    // Each vertex is one instance of the VertexPositionColor struct.
    const UINT stride = sizeof(VertexPositionColor);
    const UINT offset = 0;
    context->IASetVertexBuffers(
        0,
        1,
        m_vertexBuffer.GetAddressOf(),
        &stride,
        &offset
        );
    context->IASetIndexBuffer(
        m_indexBuffer.Get(),
        DXGI_FORMAT_R16_UINT, // Each index is one 16-bit unsigned integer (short).
        0
        );
    context->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
    context->IASetInputLayout(m_inputLayout.Get());

    // Attach the vertex shader.
    context->VSSetShader(
        m_vertexShader.Get(),
        nullptr,
        0
        );
    // Apply the model constant buffer to the vertex shader.
    context->VSSetConstantBuffers(
        0,
        1,
        m_modelConstantBuffer.GetAddressOf()
        );

    if (!m_usingVprtShaders)
    {
        // On devices that do not support the D3D11_FEATURE_D3D11_OPTIONS3::
        // VPAndRTArrayIndexFromAnyShaderFeedingRasterizer optional feature,
        // a pass-through geometry shader is used to set the render target
        // array index.
        context->GSSetShader(
            m_geometryShader.Get(),
            nullptr,
            0
            );
    }

    // Attach the pixel shader.
    context->PSSetShader(
        m_pixelShader.Get(),
        nullptr,
        0
        );

    // Draw the objects.
    context->DrawIndexedInstanced(
        m_indexCount,   // Index count per instance.
        2,              // Instance count.
        0,              // Start index location.
        0,              // Base vertex location.
        0               // Start instance location.
        );
}

task<void> SpinningCubeRenderer::CreateDeviceDependentResourcesAsync()
{
    m_usingVprtShaders = m_deviceResources->GetDeviceSupportsVprt();

    // On devices that do support the D3D11_FEATURE_D3D11_OPTIONS3::
    // VPAndRTArrayIndexFromAnyShaderFeedingRasterizer optional feature
    // we can avoid using a pass-through geometry shader to set the render
    // target array index, thus avoiding any overhead that would be
    // incurred by setting the geometry shader stage.
    std::wstring vertexShaderFileName = m_usingVprtShaders ? L"ms-appx:///CubeVPRTVertexShader.cso" : L"ms-appx:///CubeVertexShader.cso";

    // Load shaders asynchronously.
    task<std::vector<byte>> loadVSTask = DX::ReadDataAsync(vertexShaderFileName);
    task<std::vector<byte>> loadPSTask = DX::ReadDataAsync(L"ms-appx:///CubePixelShader.cso");

    task<std::vector<byte>> loadGSTask;
    if (!m_usingVprtShaders)
    {
        // Load the pass-through geometry shader.
        loadGSTask = DX::ReadDataAsync(L"ms-appx:///CubeGeometryShader.cso");
    }

    // After the vertex shader file is loaded, create the shader and input layout.
    task<void> createVSTask = loadVSTask.then([this] (const std::vector<byte>& fileData)
    {
        DX::ThrowIfFailed(
            m_deviceResources->GetD3DDevice()->CreateVertexShader(
                fileData.data(),
                fileData.size(),
                nullptr,
                &m_vertexShader
                )
            );

        constexpr std::array<D3D11_INPUT_ELEMENT_DESC, 2> vertexDesc = {{
            { "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, offsetof(VertexPositionColor, pos),   D3D11_INPUT_PER_VERTEX_DATA, 0 },
            { "COLOR",    0, DXGI_FORMAT_R32G32B32_FLOAT, 0, offsetof(VertexPositionColor, color), D3D11_INPUT_PER_VERTEX_DATA, 0 },
        }};

        DX::ThrowIfFailed(
            m_deviceResources->GetD3DDevice()->CreateInputLayout(
                vertexDesc.data(),
                vertexDesc.size(),
                fileData.data(),
                fileData.size(),
                &m_inputLayout
                )
            );
    });

    // After the pixel shader file is loaded, create the shader and constant buffer.
    task<void> createPSTask = loadPSTask.then([this] (const std::vector<byte>& fileData)
    {
        DX::ThrowIfFailed(
            m_deviceResources->GetD3DDevice()->CreatePixelShader(
                fileData.data(),
                fileData.size(),
                nullptr,
                &m_pixelShader
                )
            );

        const CD3D11_BUFFER_DESC constantBufferDesc(sizeof(CubeModelConstantBuffer), D3D11_BIND_CONSTANT_BUFFER);
        DX::ThrowIfFailed(
            m_deviceResources->GetD3DDevice()->CreateBuffer(
                &constantBufferDesc,
                nullptr,
                &m_modelConstantBuffer
                )
            );
    });

    task<void> createGSTask;
    if (!m_usingVprtShaders)
    {
        // After the pass-through geometry shader file is loaded, create the shader.
        createGSTask = loadGSTask.then([this] (const std::vector<byte>& fileData)
        {
            DX::ThrowIfFailed(
                m_deviceResources->GetD3DDevice()->CreateGeometryShader(
                    &fileData[0],
                    fileData.size(),
                    nullptr,
                    &m_geometryShader
                    )
                );
        });
    }

    // Once all shaders are loaded, create the mesh.
    task<void> shaderTaskGroup = m_usingVprtShaders ? (createPSTask && createVSTask) : (createPSTask && createVSTask && createGSTask);
    task<void> finalLoadingTask  = shaderTaskGroup.then([this] ()
    {
        static const std::array<VertexPositionColor, 8> cubeVertices =
        {{
            { float3(-0.5f, -0.5f, -0.5f), float3(0.0f, 0.0f, 0.0f) },
            { float3(-0.5f, -0.5f,  0.5f), float3(0.0f, 0.0f, 1.0f) },
            { float3(-0.5f,  0.5f, -0.5f), float3(0.0f, 1.0f, 0.0f) },
            { float3(-0.5f,  0.5f,  0.5f), float3(0.0f, 1.0f, 1.0f) },
            { float3( 0.5f, -0.5f, -0.5f), float3(1.0f, 0.0f, 0.0f) },
            { float3( 0.5f, -0.5f,  0.5f), float3(1.0f, 0.0f, 1.0f) },
            { float3( 0.5f,  0.5f, -0.5f), float3(1.0f, 1.0f, 0.0f) },
            { float3( 0.5f,  0.5f,  0.5f), float3(1.0f, 1.0f, 1.0f) },
        }};

        D3D11_SUBRESOURCE_DATA vertexBufferData = {0};
        vertexBufferData.pSysMem = cubeVertices.data();
        vertexBufferData.SysMemPitch = 0;
        vertexBufferData.SysMemSlicePitch = 0;
        const CD3D11_BUFFER_DESC vertexBufferDesc(sizeof(cubeVertices), D3D11_BIND_VERTEX_BUFFER);
        DX::ThrowIfFailed(
            m_deviceResources->GetD3DDevice()->CreateBuffer(
                &vertexBufferDesc,
                &vertexBufferData,
                &m_vertexBuffer
                )
            );

        constexpr std::array<uint16_t, 36> cubeIndices =
        {{
            2,1,0, // -x
            2,3,1,

            6,4,5, // +x
            6,5,7,

            0,1,5, // -y
            0,5,4,

            2,6,7, // +y
            2,7,3,

            0,4,6, // -z
            0,6,2,

            1,3,7, // +z
            1,7,5,
        }};

        m_indexCount = cubeIndices.size();

        D3D11_SUBRESOURCE_DATA indexBufferData = {0};
        indexBufferData.pSysMem          = cubeIndices.data();
        indexBufferData.SysMemPitch      = 0;
        indexBufferData.SysMemSlicePitch = 0;
        const CD3D11_BUFFER_DESC indexBufferDesc(sizeof(cubeIndices), D3D11_BIND_INDEX_BUFFER);
        DX::ThrowIfFailed(
            m_deviceResources->GetD3DDevice()->CreateBuffer(
                &indexBufferDesc,
                &indexBufferData,
                &m_indexBuffer
                )
            );
    });

    return finalLoadingTask;
}

void SpinningCubeRenderer::ReleaseDeviceDependentResources()
{
    m_usingVprtShaders = false;
    m_sourceVoice->DestroyVoice();
    m_nearbyVoice->DestroyVoice();

    m_vertexShader.Reset();
    m_inputLayout.Reset();
    m_pixelShader.Reset();
    m_geometryShader.Reset();
    m_modelConstantBuffer.Reset();
    m_vertexBuffer.Reset();
    m_indexBuffer.Reset();
}

HRESULT SpinningCubeRenderer::CreateNearbyAudio()
{
    LPCWSTR file = L"Content/Sounds//beep.wav";
    auto hr = m_nearbyFile.Initialize(file);
    OutputDebugStringA(" **NEARBY AUDIO 1** ");
    
    
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" **NEARBY AUDIO 2** ");
        hr = m_xaudio2->CreateSourceVoice( &m_nearbyVoice, m_nearbyFile.GetFormat() ); 
    }
    
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" **NEARBY AUDIO 3** ");
        XAUDIO2_BUFFER buffer{};
        buffer.AudioBytes = static_cast<UINT32>(m_nearbyFile.GetSize());
        buffer.pAudioData = m_nearbyFile.GetData();
        buffer.LoopCount = 0;
        hr = m_nearbyVoice->SubmitSourceBuffer(&buffer);
    }
    
    return hr;
}

float SpinningCubeRenderer::FindNearbyBound( Windows::Foundation::Numerics::float3 target)
{
    if (target.z > 0)
        return 1.2f;
    else
        return -0.8f;
}
