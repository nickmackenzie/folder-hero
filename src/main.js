import html2canvas from "html2canvas";

document.getElementById("visualizeBtn").addEventListener("click", visualizeFolderStructure);
document.getElementById("exportImgBtn").addEventListener("click", exportAsImage);
document.getElementById("exportTxtBtn").addEventListener("click", exportAsText);
document.getElementById("generateScriptBtn").addEventListener("click", generateScript);

let tree;
let currentNode;

function visualizeFolderStructure() {
    const input = document.getElementById("folderInput").value;
    const root = parseFolderStructure(input);
    tree = new TreeView(root, document.getElementById("folderTree"));
    tree.reload();
    addTreeInteractivity(tree);
}

function parseFolderStructure(input) {
    const lines = input.split("\n");
    const root = new TreeNode("root");
    const stack = [root];

    lines.forEach((line, index) => {
        const depth = (line.match(/^\s*/)[0].length || 0) / 4; // Assuming 4 spaces indentation
        const name = line.trim();
        const node = new TreeNode(name);

        while (stack.length > depth + 1) {
            stack.pop();
        }
        stack[stack.length - 1].addChild(node);
        stack.push(node);
    });

    return root;
}

function addTreeInteractivity(tree) {
    const container = tree.getContainer();

    container.addEventListener("dblclick", (event) => {
        const target = event.target;
        if (target.tagName === "SPAN") {
            renameNode(target, tree);
        }
    });

    container.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const target = event.target;
        if (target.tagName === "SPAN") {
            currentNode = tree.getNodeByElement(target);
            showContextMenu(event);
        }
    });

    document.getElementById("renameNode").addEventListener("click", () => handleContextMenuAction("Rename"));
    document.getElementById("moveNode").addEventListener("click", () => handleContextMenuAction("Move"));
    document.getElementById("nestNode").addEventListener("click", () => handleContextMenuAction("Nest"));
    document.getElementById("deleteNode").addEventListener("click", () => handleContextMenuAction("Delete"));
    document.getElementById("createNode").addEventListener("click", () => handleContextMenuAction("Create"));
    document.getElementById("cloneNode").addEventListener("click", () => handleContextMenuAction("Clone"));
}

function renameNode(target, tree) {
    const node = tree.getNodeByElement(target);
    const newName = prompt("Enter new name:", node.getUserObject().toString());
    if (newName) {
        node.setUserObject(newName);
        tree.reload();
    }
}

function showContextMenu(event) {
    const contextMenu = document.getElementById("contextMenu");
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.display = "block";

    document.addEventListener("click", () => {
        contextMenu.style.display = "none";
    }, { once: true });
}

function handleContextMenuAction(action) {
    const node = currentNode;

    switch (action) {
        case "Rename":
            renameNode(document.querySelector(`[data-node-id="${node.id}"]`), tree);
            break;
        case "Move":
            // Implement move functionality
            break;
        case "Nest":
            // Implement nest functionality
            break;
        case "Delete":
            node.getParent().removeChild(node);
            tree.reload();
            break;
        case "Create":
            const newNode = new TreeNode("New Node");
            node.addChild(newNode);
            tree.reload();
            break;
        case "Clone":
            const cloneNode = node.clone();
            node.getParent().addChild(cloneNode);
            tree.reload();
            break;
    }
}

function exportAsImage() {
    html2canvas(document.getElementById("outputContainer")).then((canvas) => {
        const link = document.createElement("a");
        link.download = "folder_structure.png";
        link.href = canvas.toDataURL();
        link.click();
    });
}

function exportAsText() {
    const input = document.getElementById("folderInput").value;
    const blob = new Blob([input], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "folder_structure.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
}

function generateScript() {
    const input = document.getElementById("folderInput").value;
    const windowsScript = generateWindowsScript(input);
    const linuxScript = generateLinuxScript(input);
    const macScript = generateMacScript(input);

    const outputContainer = document.getElementById("outputContainer");
    outputContainer.innerHTML = `
        <h3 class="title is-4">Windows Script:</h3>
        <pre>${windowsScript}</pre>
        <h3 class="title is-4">Linux Script:</h3>
        <pre>${linuxScript}</pre>
        <h3 class="title is-4">Mac Script:</h3>
        <pre>${macScript}</pre>
    `;
}

function generateWindowsScript(input) {
    const lines = input.split("\n");
    return lines.map((line) => `mkdir ${line.trim()}`).join("\n");
}

function generateLinuxScript(input) {
    const lines = input.split("\n");
    return lines.map((line) => `mkdir -p ${line.trim()}`).join("\n");
}

function generateMacScript(input) {
    return generateLinuxScript(input); 
}
