document.addEventListener('DOMContentLoaded', function() {
    const components = document.querySelectorAll('.component');
    const previewArea = document.getElementById('preview-area');
    const propertiesPanel = document.getElementById('properties-content');
    let selectedComponent = null;

    // Lohistamise funktsioonid
    components.forEach(component => {
        component.setAttribute('draggable', 'true');
        
        component.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('componentType', component.dataset.type);
        });
    });

    previewArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    previewArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('componentType');
        
        if (componentType) {
            const component = createComponent(componentType);
            // Lisa komponent hiirekursori asukohta
            const rect = previewArea.getBoundingClientRect();
            const y = e.clientY - rect.top;
            
            // Leia lähim element
            const elements = Array.from(previewArea.children);
            const closest = elements.find(el => {
                const box = el.getBoundingClientRect();
                return y < box.top + box.height / 2;
            });

            if (closest) {
                previewArea.insertBefore(component, closest);
            } else {
                previewArea.appendChild(component);
            }
        }
    });

    // Uus funktsioon komponendi loomiseks
    function createComponent(type) {
        const component = document.createElement('div');
        component.className = `preview-component ${type}`;
        component.setAttribute('contenteditable', 'true');

        // Lisa kustutamise nupp
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteComponent(component);
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

        // Lisa kliki kuulaja
        component.addEventListener('click', (e) => {
            e.stopPropagation();
            selectComponent(component);
        });

        return component;
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
                    <div class="property">
                        <label>Laadimise tüüp:</label>
                        <select onchange="updateProgressType(this.value)">
                            <option value="static">Staatiline</option>
                            <option value="loading">Laadimine</option>
                            <option value="progress">Edenemise näitaja</option>
                        </select>
                    </div>
                `;
                break;
            case 'button':
                additionalProperties = `
                    <div class="property">
                        <label>Nupu tekst:</label>
                        <input type="text" value="${component.textContent}"
                            onchange="updateButtonText(this.value)">
                    </div>
                    <div class="property">
                        <label>Lingi URL:</label>
                        <input type="text" value="${component.getAttribute('data-href') || ''}"
                            onchange="updateButtonLink(this.value)">
                    </div>
                `;
                break;
            case 'image':
                additionalProperties = `
                    <div class="property">
                        <label>Pildi URL:</label>
                        <input type="text" value="${component.querySelector('img').src}"
                            onchange="updateImageSrc(this.value)">
                    </div>
                    <div class="property">
                        <label>Alt tekst:</label>
                        <input type="text" value="${component.querySelector('img').alt || ''}"
                            onchange="updateImageAlt(this.value)">
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

    // Uuendamise funktsioonid
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

    window.updateProgressType = function(type) {
        if (selectedComponent) {
            const fill = selectedComponent.querySelector('.progressbar-fill');
            if (fill) {
                switch(type) {
                    case 'loading':
                        fill.style.animation = 'loading 2s infinite';
                        break;
                    case 'progress':
                        fill.style.animation = 'none';
                        fill.style.transition = 'width 0.3s ease-in-out';
                        break;
                    default:
                        fill.style.animation = 'none';
                        break;
                }
            }
        }
    };

    window.updateButtonText = function(value) {
        if (selectedComponent) {
            selectedComponent.textContent = value;
        }
    };

    window.updateButtonLink = function(value) {
        if (selectedComponent) {
            selectedComponent.setAttribute('data-href', value);
            selectedComponent.onclick = () => window.open(value, '_blank');
        }
    };

    window.updateImageSrc = function(value) {
        if (selectedComponent) {
            const img = selectedComponent.querySelector('img');
            if (img) {
                img.src = value;
            }
        }
    };

    window.updateImageAlt = function(value) {
        if (selectedComponent) {
            const img = selectedComponent.querySelector('img');
            if (img) {
                img.alt = value;
            }
        }
    };

    // Lisa see CSS animatsioon styles.css faili
}); 