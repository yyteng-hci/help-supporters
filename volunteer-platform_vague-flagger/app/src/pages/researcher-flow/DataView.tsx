import { Button } from '@mui/material';
import { useState } from 'react';
import { io } from 'socket.io-client';
import { Log } from '../../components/Log';
import { formattedAssistanceType, VIPUser } from '../../types/VIPUser';
import { getFormattedHelperList } from '../vip-flow/AssistanceRequest';

export function DataViewPage() {
	const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

	const [logs, setLogs] = useState<string[]>([]);

	socket.on('info-message', (stringifiedMessage) => {
		const info = JSON.parse(stringifiedMessage);

		switch (info.msgCode) {
			case 'help-requested':
				addLog(
					`${info.message}, VIP: ${getReadableVIP(info.vip)}, Selected Helpers: ${getFormattedHelperList(info.helpers, true)}, All Available Helpers: ${getFormattedHelperList(info.allHelpers, true)}`
				);
				break;
			case 'match':
				addLog(`${info.message}, VIP: ${getReadableVIP(info.vip)}, Helper: ${info.helper.name}`);
				break;
		}
	});

	function addLog(log: string) {
		const updatedLogsList = [...logs];

		updatedLogsList.push(log);

		setLogs(updatedLogsList);
	}

	return (
		<div id='dataViewPage'>
			<div id='logsWrapper'>
				<h1>Session Data</h1>
				<div id='logListWrapper'>
					{logs.map((value, idx) => {
						return <Log key={idx} log={value}></Log>;
					})}
				</div>
			</div>
			<div id='saveButtonContainer'>
				<Button
					variant='contained'
					onPointerDown={() => {
						socket.emit('clear-server-data');

						setLogs([]);
					}}
				>
					Clear Server Data
				</Button>
				<Button variant='contained' onPointerDown={() => saveLogsAsTxt(logs)}>
					Save Data (.txt)
				</Button>
			</div>
		</div>
	);
}

function saveLogsAsTxt(logs: string[]) {
	const element = document.createElement('a');
	const file = new Blob(
		[
			logs
				.map((e) => '- ' + e)
				.join('\n')
				.replace(/\n/g, '\r\n')
		],
		{ type: 'text/plain' }
	);

	element.href = URL.createObjectURL(file);
	element.download = `Log - ${new Date().toUTCString()}.txt`;
	document.body.appendChild(element); // Required for this to work in FireFox
	element.click();
}

export function getReadableVIP(vip: VIPUser) {
	return `${vip.name} (Tool: ${vip.assistanceTool}, Assistance Type: ${formattedAssistanceType(vip.assistanceInfo!.assistanceType, true)}, Time Commitment: ${
		vip.assistanceInfo!.timeCommitment
	} minute(s), Additional Info: ${vip.assistanceInfo!.moreInfo})`;
}
