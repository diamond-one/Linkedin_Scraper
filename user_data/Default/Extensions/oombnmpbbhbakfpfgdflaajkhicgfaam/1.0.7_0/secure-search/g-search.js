const processedParsedNodes = new Set();
const processedRenderedNodes = new Set();

function CheckSetting() {
	chrome.storage.local.get(["cfg"], (result) => {
		const isEnabled = result.cfg.searchOption;
		if (isEnabled) {
			ObserveMutations();
			const parsedNodes = GetParentParsedNodes();
			ParseDom(parsedNodes);
			CreatePopup();
			WaitForResponse();
		}
	});
}

function WaitForResponse() {
	chrome.runtime.onMessage.addListener((msg, sender, resp) => {
		if (msg.payload === Object(msg.payload)) {
			const nodes = GetParentRenderedNodes();
			RenderDom(msg.payload, nodes);
		}
		resp();
	});
}

CheckSetting();

function GetParentNodes(processedNodes, parseError) {
	const parentNodeList = document.querySelectorAll(".yuRUbf, .ct3b9e, .nhaZ2c, .eejeod");
	const childNodeList = document.querySelectorAll(".B6fmyf, .p4InSe.znvUFb");

	try {
		if (parentNodeList.length == 0 || childNodeList.length == 0 || parentNodeList.length !== childNodeList.length) {
			throw new Error(parseError);
		}

		const sponsoredNodeList = document.querySelectorAll(".sVXRqc");
		const allNodes = [...parentNodeList, ...sponsoredNodeList];
		const newNodes = GetNewNodes(allNodes, processedNodes);
		return newNodes;
	} catch (err) {
		chrome.runtime.sendMessage({ msg: "log-info", info: err.stack });
		return err.stack;
	}
}

function GetNewNodes(allNodesArr, processedNodesSet) {
	const newNodes = [];
	allNodesArr.forEach((node) => {
		if (!processedNodesSet.has(node)) {
			newNodes.push(node);
			processedNodesSet.add(node);
		}
	});
	return newNodes;
}

function GetParentParsedNodes() {
	return GetParentNodes(processedParsedNodes, "Error parsing Google nodes.");
}

function GetParentRenderedNodes() {
	return GetParentNodes(processedRenderedNodes, "Error parsing rendered Google search nodes.");
}

function GetTargetNode(node) {
	let targetNode;

	if (node.nodeName.toLowerCase() === "a" && node.classList.contains("sVXRqc")) {
		targetNode = node.parentNode.querySelector(".d8lRkd");
	} else {
		targetNode = node.querySelector(".csDOgf") || node.querySelector(".B6fmyf") || node.querySelector(".TRQZRb");
	}

	return targetNode;
}

function ObserveMutations() {
	const observer = new MutationObserver((mutations) => {
		if (ShouldTriggerParseDom()) {
			const parsedNodes = GetParentParsedNodes();
			ParseDom(parsedNodes);
		}
	});

	observer.observe(document, { childList: true, subtree: true });
}

function ShouldTriggerParseDom() {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const windowHeight = window.innerHeight;
	const documentHeight = document.documentElement.scrollHeight;
	const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
	return scrollPercentage >= 0;
}
