document.addEventListener('DOMContentLoaded', function() {
    const components = document.querySelectorAll('.component');
    const previewArea = document.getElementById('preview-area');
    const propertiesPanel = document.getElementById('properties-content');
    let selectedComponent = null;
    let draggedComponent = null;

    // Lohistamise funktsioonid
    components.forEach(component => {
        component.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', component.dataset.type);
            draggedComponent = component;
            component.classList.add('dragging');
        });

        component.addEventListener('dragend', () => {
            component.classList.remove('dragging');
            draggedComponent = null;
        });
    });

    previewArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        const afterElement = getDragAfterElement(previewArea, e.clientY);
        if (afterElement) {
            previewArea.insertBefore(draggedComponent, afterElement);
        } else {
            previewArea.appendChild(draggedComponent);
        }
    });

    previewArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        addComponent(type, e.clientY);
    });

    // Abifunktsioon lohistamise järjekorra määramiseks
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.preview-component:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Komponendi lisamine
    function addComponent(type, yPosition) {
        const component = document.createElement('div');
        component.className = `preview-component ${type}`;
        component.setAttribute('contenteditable', 'true');

        // Lisa kustutamise nupp
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            component.remove();
        };

        switch(type) {
            case 'heading':
                component.textContent = 'Uus pealkiri';
                break;
            case 'text':
                component.textContent = 'Uus tekst';
                break;
            case 'button':
                component.textContent = 'Nupp';
                component.setAttribute('onclick', 'alert("Nupp töötab!")');
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
            case 'card':
                component.className += ' card';
                component.innerHTML = `
                    <h3>Kaardi pealkiri</h3>
                    <p>Kaardi sisu</p>
                    <button class="button">Tegevus</button>
                `;
                break;
            case 'progressbar':
                component.className += ' progressbar';
                const fill = document.createElement('div');
                fill.className = 'progressbar-fill';
                fill.style.width = '50%';
                component.appendChild(fill);
                break;
            case 'divider':
                component.className += ' divider';
                component.setAttribute('contenteditable', 'false');
                break;
        }

        component.appendChild(deleteButton);

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
        const type = component.className.split(' ')[1];
        let additionalProperties = '';

        switch(type) {
            case 'progressbar':
                additionalProperties = `
                    <div class="property">
                        <label>Edenemise %:</label>
                        <input type="range" min="0" max="100" value="${parseInt(component.querySelector('.progressbar-fill').style.width)}"
                            onchange="updateProgress(this.value)">
                    </div>
                `;
                break;
            case 'button':
                additionalProperties = `
                    <div class="property">
                        <label>Onclick funktsioon:</label>
                        <input type="text" value="${component.getAttribute('onclick') || ''}"
                            onchange="updateOnClick(this.value)">
                    </div>
                `;
                break;
        }

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
            ${additionalProperties}
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

    window.updateProgress = function(value) {
        if (selectedComponent) {
            const fill = selectedComponent.querySelector('.progressbar-fill');
            if (fill) {
                fill.style.width = `${value}%`;
            }
        }
    };

    window.updateOnClick = function(value) {
        if (selectedComponent) {
            selectedComponent.setAttribute('onclick', value);
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

    // Lisa taustavärvi ja suuruse muutmise funktsioonid
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgSizeSlider = document.getElementById('bgSizeSlider');
    const bgSizeValue = document.getElementById('bgSizeValue');
    const previewArea = document.getElementById('preview-area');

    bgColorPicker.addEventListener('input', (e) => {
        previewArea.style.backgroundColor = e.target.value;
    });

    bgSizeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        previewArea.style.transform = `scale(${value / 100})`;
        bgSizeValue.textContent = `${value}%`;
        
        // Lisa visuaalne tagasiside
        const thumb = e.target;
        thumb.style.setProperty('--thumb-scale', '1.1');
        setTimeout(() => {
            thumb.style.setProperty('--thumb-scale', '1');
        }, 200);
    });

    // Ekspordi funktsioon
    function exportHTML() {
        const previewArea = document.getElementById('preview-area');
        const components = Array.from(previewArea.children);
        
        let exportContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Eksporditud leht</title>
    <style>
        ${document.querySelector('style').textContent}
    </style>
</head>
<body>
    <div class="content">
        ${components.map(comp => {
            const clone = comp.cloneNode(true);
            // Eemalda kustutamise nupud
            const deleteBtn = clone.querySelector('.delete-button');
            if (deleteBtn) deleteBtn.remove();
            return clone.outerHTML;
        }).join('\n')}
    </div>
</body>
</html>`;

        const blob = new Blob([exportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eksport.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Lisa ekspordi nupu kuulaja
    document.getElementById('exportButton').addEventListener('click', exportHTML);

    // Komponendi kustutamise funktsioon
    function deleteComponent(component) {
        if (component === selectedComponent) {
            selectedComponent = null;
            propertiesPanel.innerHTML = '';
        }
        component.remove();
    }
}); 