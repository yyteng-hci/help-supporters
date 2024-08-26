import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Pages
import { HelperUserInformation } from './pages/helper-flow/HelperUserInformation';
import { HelperWaitScreen } from './pages/helper-flow/HelperWaitScreen';
import { GettingStarted } from './pages/scratchpad-flow/GettingStarted';
import { ScratchpadStartScreen } from './pages/scratchpad-flow/ScratchpadStartScreen';
import { Signup } from './pages/Signup';
import { AssistanceRequest } from './pages/vip-flow/AssistanceRequest';
import { VIPDashboard } from './pages/vip-flow/VIPDashboard';
import { VIPUserInformation } from './pages/vip-flow/VIPUserInformation';
import { VIPAdditionalInfo } from './pages/vip-flow/VIPAdditionalInfo';
import { TextInsertPage } from './pages/researcher-flow/TextInsert';
import { DataViewPage } from './pages/researcher-flow/DataView';
import { ConnectionWaitPage } from './pages/researcher-flow/ConnectionWait';
import { Scratchpad } from './pages/scratchpad-flow/Scratchpad';
import { Notes } from './pages/scratchpad-flow/Notes';

function App() {
	return (
		<div className='App'>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Signup />} />
					<Route path='/vip'>
						<Route index element={<VIPUserInformation />} />
						<Route path='dashboard' element={<VIPDashboard />} />
						<Route path='additional-info' element={<VIPAdditionalInfo />} />
						<Route path='assistance-request' element={<AssistanceRequest />} />
					</Route>
					<Route path='/helper'>
						<Route index element={<HelperUserInformation />} />
						<Route path='wait-screen' element={<HelperWaitScreen />} />
					</Route>
					<Route path='/scratchpad'>
						<Route index element={<ScratchpadStartScreen />} />
						<Route path='getting-started' element={<GettingStarted />} />
						<Route path='scratchpad' element={<Scratchpad />} />
						<Route path='notes' element={<Notes />} />
					</Route>
					<Route path='/researcher'>
						<Route index element={<ConnectionWaitPage />} />
						<Route path='text-insert' element={<TextInsertPage />} />
						<Route path='view-data' element={<DataViewPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
