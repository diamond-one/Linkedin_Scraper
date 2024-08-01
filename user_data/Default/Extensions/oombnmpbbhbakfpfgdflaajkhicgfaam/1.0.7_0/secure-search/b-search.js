let currParentNodes = [];

function CheckSetting() {
	chrome.storage.local.get(["cfg"], (result) => {
		const isEnabled = result.cfg.searchOption;

		if (isEnabled) {
			ObserveMutations();
			currParentNodes = GetParentNodes();
			ParseDom(currParentNodes);
			CreatePopup();
			WaitForResponse();
		}
	});
}

function WaitForResponse() {
	chrome.runtime.onMessage.addListener((msg, sender, resp) => {
		if (msg.payload === Object(msg.payload)) {
			const nodes = GetParentNodes();
			RenderDom(msg.payload, nodes);
		}
		resp();
	});
}

CheckSetting();

function GetParentNodes() {
	const parentNodeList = document.querySelectorAll("main ol > li.b_algo");
	const childNodeList = document.querySelectorAll("main ol > li.b_algo div.b_attribution");

	try {
		if (parentNodeList.length == 0 || childNodeList.length == 0 || parentNodeList.length !== childNodeList.length) {
			throw new Error("Error parsing Bing nodes");
		}
		const sponsoredNodeList = document.querySelectorAll("main ol div.sb_add");
		return [...parentNodeList, ...sponsoredNodeList];
	} catch (err) {
		chrome.runtime.sendMessage({ msg: "log-info", info: err.stack });
		return err.stack;
	}
}

function GetTargetNode(node) {
	const targetNode = node.querySelector("div.b_attribution");

	try {
		if (targetNode?.querySelector("cite")) {
			return targetNode;
		} else {
			throw new Error(`Rendering Bing node : ${targetNode.innerHTML}`);
		}
	} catch (err) {
		return err.stack;
	}
}

function CheckParentNodesEquality(currNodes, nextNodes) {
	if (currNodes.length !== nextNodes.length) {
		return false;
	}

	return nextNodes.every((node, idx) => node === currNodes[idx]);
}

function ObserveMutations() {
	const targetNode = document.body;
	const observer = new MutationObserver((mutations) => {
		const resultsElem = targetNode.querySelector("#b_results");

		if (resultsElem.querySelector(".shadowHost")) {
			return;
		}

		const parentNodes = GetParentNodes();

		if (CheckParentNodesEquality(currParentNodes, parentNodes)) {
			return;
		}

		currParentNodes = parentNodes;
		ParseDom(parentNodes);
	});

	observer.observe(targetNode, { childList: true });
}
