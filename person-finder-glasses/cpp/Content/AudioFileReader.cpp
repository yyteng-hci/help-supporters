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

#include <initguid.h>
#include "pch.h"
#include "AudioFileReader.h"
#include <mfapi.h>
#include <mfidl.h>
#include <mfreadwrite.h>



_Use_decl_annotations_
HRESULT AudioFileReader::Initialize(LPCWSTR filename)
{
    BOOL mfStarted = FALSE;
    HRESULT hr = CoInitializeEx(0, COINIT_MULTITHREADED);
    hr = MFStartup(MF_VERSION);
    //OutputDebugStringA(std::to_string(MF_VERSION).c_str());
    mfStarted = SUCCEEDED(hr);
    
    ComPtr<IMFSourceReader> reader;
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 1");
        hr = MFCreateSourceReaderFromURL(filename,NULL, &reader);
    }
    
    // Select the first audio stream, and deselect all other streams.
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 2");
        hr = reader->SetStreamSelection(static_cast<DWORD>(MF_SOURCE_READER_ALL_STREAMS), FALSE);
    }
     OutputDebugStringA(std::to_string(hr).c_str());
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 3");
        hr = reader->SetStreamSelection(static_cast<DWORD>(MF_SOURCE_READER_FIRST_AUDIO_STREAM), TRUE);
    }
     OutputDebugStringA(std::to_string(hr).c_str());
    // Create a partial media type that specifies uncompressed PCM audio.
    ComPtr<IMFMediaType> partialType;
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 4");
        hr = MFCreateMediaType(&partialType);
    }
    OutputDebugStringA(std::to_string(hr).c_str());
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 5");
        hr = partialType->SetGUID(MF_MT_MAJOR_TYPE, MFMediaType_Audio);
    }
    OutputDebugStringA(std::to_string(hr).c_str());
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 6");
        hr = partialType->SetGUID(MF_MT_SUBTYPE, MFAudioFormat_PCM);
    }
    OutputDebugStringA(std::to_string(hr).c_str());
    // Set this type on the source reader. The source reader will load the necessary decoder.
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 7 ");
        hr = reader->SetCurrentMediaType(static_cast<DWORD>(MF_SOURCE_READER_FIRST_AUDIO_STREAM), nullptr, partialType.Get());
    }

    // Get the complete uncompressed format
    ComPtr<IMFMediaType> uncompressedAudioType;
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 8 ");
        hr = reader->GetCurrentMediaType(static_cast<DWORD>(MF_SOURCE_READER_FIRST_AUDIO_STREAM), &uncompressedAudioType);
    }

    // Ensure the stream is selected.
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 9 ");
        hr = reader->SetStreamSelection(static_cast<DWORD>(MF_SOURCE_READER_FIRST_AUDIO_STREAM), TRUE);
    }

    // Get the audio block size and number of bytes/second from the audio format.
    if (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered  10 ");
        WAVEFORMATEX* format = nullptr;
        UINT32 size = 0;
        hr = MFCreateWaveFormatExFromMFMediaType(uncompressedAudioType.Get(), &format, &size);

        // Only mono PCM files are supported for HRTF processing
        if (SUCCEEDED(hr) && format->wFormatTag != WAVE_FORMAT_PCM && format->nChannels != 1)
        {
            hr = E_INVALIDARG;
        }

        if (SUCCEEDED(hr))
        {
            CopyMemory(&_format, format, sizeof WAVEFORMATEX);
        }

        if (format)
        {
            CoTaskMemFree(format);
        }
    }

    // Get audio samples from the source reader.
    _audioData.resize(0);
    while (SUCCEEDED(hr))
    {
        OutputDebugStringA(" entered 11 ");
        DWORD dwFlags = 0;

        // Read the next sample.
        ComPtr<IMFSample> sample;
        hr = reader->ReadSample(static_cast<DWORD>(MF_SOURCE_READER_FIRST_AUDIO_STREAM), 0, nullptr, &dwFlags, nullptr, &sample);

        if (SUCCEEDED(hr) && (dwFlags & MF_SOURCE_READERF_ENDOFSTREAM) != 0)
        {
            // End of stream
            break;
        }

        if (SUCCEEDED(hr) && sample == nullptr)
        {
            // No sample, keep going
            continue;
        }

        // Get a pointer to the audio data in the sample.
        ComPtr<IMFMediaBuffer> buffer;
        if (SUCCEEDED(hr))
        {
            OutputDebugStringA(" entered 12 ");
            hr = sample->ConvertToContiguousBuffer(&buffer);
        }

        DWORD bufferSize = 0;
        if (SUCCEEDED(hr))
        {
            OutputDebugStringA(" entered 13 ");
            BYTE* data;
            hr = buffer->Lock(&data, nullptr, &bufferSize);

            auto currentDataSize = _audioData.size();
            if (SUCCEEDED(hr))
            {
                _audioData.resize(currentDataSize + bufferSize);
            }

            if (SUCCEEDED(hr))
            {
                CopyMemory(_audioData.data() + currentDataSize, data, bufferSize);
                // Unlock the buffer
                hr = buffer->Unlock();
            }
        }
    }

    if (mfStarted)
    {
        MFShutdown();
    }

    return hr;
}