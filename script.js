document.addEventListener('DOMContentLoaded', function() {
    const components = document.querySelectorAll('.component');
    const previewArea = document.getElementById('preview-area');
    const propertiesPanel = document.getElementById('properties-content');
    let selectedComponent = null;

    // Lohistamise funktsioonid
    components.forEach(component => {
        component.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', component.dataset.type);
        });
    });

    previewArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    previewArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        addComponent(type, e.clientY);
    });

    // Komponendi lisamine
    function addComponent(type, yPosition) {
        const component = document.createElement('div');
        component.className = `preview-component ${type}`;
        component.setAttribute('contenteditable', 'true');

        switch(type) {
            case 'heading':
                component.textContent = 'Uus pealkiri';
                break;
            case 'text':
                component.textContent = 'Uus tekst';
                break;
            case 'button':
                component.textContent = 'Nupp';
                break;
            case 'image':
                const img = document.createElement('img');
                img.src = 'https://via.placeholder.com/150';
                component.appendChild(img);
                break;
            case 'container':
                component.className += ' container-component';
                component.textContent = 'Konteiner';
                break;
        }

        // Leia õige asukoht komponendi lisamiseks
        const components = Array.from(previewArea.children);
        let insertIndex = components.findIndex(comp => {
            const rect = comp.getBoundingClientRect();
            return yPosition < rect.top + rect.height / 2;
        });

        if (insertIndex === -1) {
            previewArea.appendChild(component);
        } else {
            previewArea.insertBefore(component, components[insertIndex]);
        }

        // Lisa sündmuste kuularid
        component.addEventListener('click', (e) => {
            e.stopPropagation();
            selectComponent(component);
        });

        component.addEventListener('input', () => {
            updateProperties(component);
        });
    }

    // Komponendi valimine
    function selectComponent(component) {
        if (selectedComponent) {
            selectedComponent.classList.remove('selected');
        }
        selectedComponent = component;
        component.classList.add('selected');
        showProperties(component);
    }

    // Omaduste näitamine
    function showProperties(component) {
        propertiesPanel.innerHTML = `
            <div class="property">
                <label>Tekst:</label>
                <input type="text" value="${component.textContent}" 
                    onchange="updateComponentText(this.value)">
            </div>
            <div class="property">
                <label>Teksti suurus:</label>
                <input type="number" value="${parseInt(getComputedStyle(component).fontSize)}" 
                    onchange="updateFontSize(this.value)">
            </div>
            <div class="property">
                <label>Värv:</label>
                <input type="color" value="${rgbToHex(getComputedStyle(component).color)}" 
                    onchange="updateColor(this.value)">
            </div>
        `;
    }

    // Abifunktsioonid
    function rgbToHex(rgb) {
        const values = rgb.match(/\d+/g);
        if (!values) return '#000000';
        return '#' + values.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }

    // Lisa globaalsed funktsioonid omaduste uuendamiseks
    window.updateComponentText = function(value) {
        if (selectedComponent) {
            selectedComponent.textContent = value;
        }
    };

    window.updateFontSize = function(value) {
        if (selectedComponent) {
            selectedComponent.style.fontSize = value + 'px';
        }
    };

    window.updateColor = function(value) {
        if (selectedComponent) {
            selectedComponent.style.color = value;
        }
    };

    // Kliki kuulaja tühistamaks valiku
    document.addEventListener('click', (e) => {
        if (e.target === previewArea) {
            if (selectedComponent) {
                selectedComponent.classList.remove('selected');
                selectedComponent = null;
                propertiesPanel.innerHTML = '';
            }
        }
    });
}); 