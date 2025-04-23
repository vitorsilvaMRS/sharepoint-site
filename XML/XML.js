let definitions = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveXMLButton").style.display = "none";

    const generateButton = document.getElementById("generateXMLButton");
    if (generateButton) {
        generateButton.addEventListener("click", function() {
            if (definitions.length > 0) {
                generateXML();
                document.getElementById("saveXMLButton").style.display = "block";
            } else {
                alert("Adicione pelo menos uma estrutura antes de gerar o XML.");
                document.getElementById("saveXMLButton").style.display = "none";
                document.getElementById("xmlOutput").value = "";
            }
        });
    } else {
        console.error("Erro: Botão 'Gerar XML' não encontrado no HTML.");
    }

    const clearButton = document.getElementById("clearAllButton");
    if (clearButton) {
        clearButton.addEventListener("click", function() {
            const xmlOutput = document.getElementById("xmlOutput").value.trim();
            if (definitions.length === 0 || xmlOutput === "") {
                alert("Nada foi gerado ainda para ser limpo.");
                return;
            }
            if (confirm("Tem certeza que deseja limpar todas as estruturas?")) {
                definitions = [];
                updateList();
                document.getElementById("xmlOutput").value = "";
                checkSaveButtonVisibility();
            }
        });
    }
});

async function saveXMLToFile() {
    try {
        const xmlContent = document.getElementById("xmlOutput").value;
        const options = {
            types: [{ description: "XML Files", accept: { "application/xml": [".xml"] } }]
        };
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(xmlContent);
        await writable.close();
        alert("Arquivo salvo com sucesso!");
    } catch (err) {
        console.error("Erro ao salvar o arquivo:", err);
    }
}

function addStructure() {
    const select = document.getElementById("structures");
    const selectedValue = select.value;

    if (!selectedValue || !selectedValue.includes(",")) {
        alert("Selecione uma estrutura válida para adicionar.");
        return;
    }

    const [category, property, categoryInternal, propertyInternal] = selectedValue.split(",");

    const structure = { category, property, categoryInternal, propertyInternal };

    const exists = definitions.some(def =>
        def.category === structure.category &&
        def.property === structure.property &&
        def.categoryInternal === structure.categoryInternal &&
        def.propertyInternal === structure.propertyInternal
    );

    if (exists) {
        alert("Esta estrutura já foi adicionada.");
    } else {
        definitions.push(structure);
        updateList();
    }
}

function updateList() {
    const list = document.getElementById("structureList");
    list.innerHTML = "";
    definitions.forEach((def, index) => {
        const li = document.createElement("li");
        li.textContent = `${def.category} - ${def.property}`;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remover";
        removeBtn.onclick = () => {
            if (confirm("Deseja remover esta estrutura?")) {
                definitions.splice(index, 1);
                updateList();
                checkSaveButtonVisibility();
            }
        };

        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

function generateXML() {
    if (definitions.length === 0) {
        document.getElementById("xmlOutput").value = "";
        return;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<exchange xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://download.autodesk.com/us/navisworks/schemas/nw-exchange-12.0.xsd">\n`;
    xml += `  <optionset name="">\n    <optionset name="interface">\n      <optionset name="smart_tags">\n        <optionarray name="definitions">\n`;

    definitions.forEach(def => {
        xml += `          <optionset name="">\n`;
        xml += `            <option name="category">\n              <data type="name">\n                <name internal="${def.categoryInternal}">${def.category}</name>\n              </data>\n            </option>\n`;
        xml += `            <option name="property">\n              <data type="name">\n                <name internal="${def.propertyInternal}">${def.property}</name>\n              </data>\n            </option>\n`;
        xml += `          </optionset>\n`;
    });

    xml += `        </optionarray>\n      </optionset>\n    </optionset>\n  </optionset>\n</exchange>`;

    document.getElementById("xmlOutput").value = xml;
    checkSaveButtonVisibility();
}

function checkSaveButtonVisibility() {
    const saveButton = document.getElementById("saveXMLButton");
    if (definitions.length > 0 && document.getElementById("xmlOutput").value.trim() !== "") {
        saveButton.style.display = "block";
    } else {
        saveButton.style.display = "none";
    }
}