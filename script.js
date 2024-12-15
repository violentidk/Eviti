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
                component.innerHTML = component.content || 'Konteiner';
                break;
            case 'card':
                component.className += ' card';
                component.innerHTML = `
                    <h3>Kaardi pealkiri</h3>
                    <p>Kaardi sisu</p>
                    <button class="button">Tegevus</button>
                `;
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

    // Lisa see funktsioon DOMContentLoaded sündmuse käsitleja sisse
    function deleteComponent(component) {
        if (component === selectedComponent) {
            selectedComponent = null;
            propertiesPanel.innerHTML = '';
        }
        component.remove();
    }

    // Lisa need mallid DOMContentLoaded sündmuse käsitleja sisse

    const templates = {
        business: [
            {
                type: 'heading',
                text: 'Tere tulemast ettevõttesse',
                styles: {
                    fontSize: '48px',
                    color: '#1a1a1a',
                    textAlign: 'center',
                    marginBottom: '20px'
                }
            },
            {
                type: 'text',
                text: 'Me pakume parimaid lahendusi teie äri jaoks',
                styles: {
                    fontSize: '24px',
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: '40px'
                }
            },
            {
                type: 'container',
                content: `
                    <h2 style="font-size: 32px; margin-bottom: 20px;">Meie teenused</h2>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div class="card">
                            <h3>Konsultatsioon</h3>
                            <p>Professionaalne ärinõustamine</p>
                            <button class="button">Loe rohkem</button>
                        </div>
                        <div class="card">
                            <h3>Arendus</h3>
                            <p>Kaasaegsed tehnilised lahendused</p>
                            <button class="button">Loe rohkem</button>
                        </div>
                        <div class="card">
                            <h3>Turundus</h3>
                            <p>Tõhusad turundusstrateegiad</p>
                            <button class="button">Loe rohkem</button>
                        </div>
                    </div>
                `
            }
        ],
        startup: [
            {
                type: 'container',
                content: `
                    <div style="text-align: center; padding: 60px 0;">
                        <h1 style="font-size: 56px; margin-bottom: 20px;">Innovatsioon algab siit</h1>
                        <p style="font-size: 24px; color: #666; margin-bottom: 30px;">Muudame maailma tehnoloogia abil</p>
                        <button class="button" style="font-size: 18px; padding: 12px 24px;">Liitu meiega</button>
                    </div>
                `
            },
            {
                type: 'container',
                content: `
                    <div style="background: #f8f9fa; padding: 40px; border-radius: 8px;">
                        <h2 style="font-size: 36px; margin-bottom: 30px;">Meie toode</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
                            <img src="https://via.placeholder.com/500x300" alt="Toode" style="width: 100%; border-radius: 8px;">
                            <div>
                                <h3 style="font-size: 24px; margin-bottom: 20px;">Revolutsiooniline lahendus</h3>
                                <p style="font-size: 16px; line-height: 1.6;">Meie toode lahendab igapäevaseid probleeme uuenduslikul viisil.</p>
                                <button class="button" style="margin-top: 20px;">Proovi tasuta</button>
                            </div>
                        </div>
                    </div>
                `
            }
        ],
        portfolio: [
            {
                type: 'container',
                content: `
                    <div style="text-align: center; margin-bottom: 60px;">
                        <h1 style="font-size: 48px; margin-bottom: 20px;">Jane Doe</h1>
                        <p style="font-size: 24px; color: #666;">UX/UI Disainer & Arendaja</p>
                    </div>
                `
            },
            {
                type: 'container',
                content: `
                    <h2 style="font-size: 36px; margin-bottom: 30px;">Minu tööd</h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">
                        <div class="card">
                            <img src="https://via.placeholder.com/400x300" alt="Projekt 1" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                            <h3>E-poe disain</h3>
                            <p>Kaasaegne e-poe lahendus</p>
                        </div>
                        <div class="card">
                            <img src="https://via.placeholder.com/400x300" alt="Projekt 2" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                            <h3>Mobiilirakendus</h3>
                            <p>Tervise jälgimise rakendus</p>
                        </div>
                    </div>
                `
            }
        ]
    };

    // Lisa mallide funktsionaalsus
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Eemalda active klass kõigilt nuppudelt ja tab-content elementidelt
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Lisa active klass klikitud nupule ja vastavale tab-content elemendile
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Muuda malli kasutamise funktsionaalsust
    document.querySelectorAll('.use-template').forEach(button => {
        button.addEventListener('click', () => {
            const templateName = button.parentElement.dataset.template;
            const template = templates[templateName];
            
            // Tühjenda preview ala
            previewArea.innerHTML = '';
            
            // Lisa malli komponendid
            template.forEach(item => {
                const component = document.createElement('div');
                component.className = `preview-component ${item.type}`;
                component.setAttribute('draggable', 'true');

                // Lisa kustutamise nupp
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
                deleteButton.onclick = (e) => {
                    e.stopPropagation();
                    deleteComponent(component);
                };

                // Lisa sisu
                if (item.content) {
                    component.innerHTML = item.content;
                } else if (item.text) {
                    component.textContent = item.text;
                }

                // Lisa stiilid
                if (item.styles) {
                    Object.assign(component.style, item.styles);
                }

                // Lisa lohistamise funktsioonid
                component.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', 'move');
                    component.classList.add('dragging');
                });

                component.addEventListener('dragend', () => {
                    component.classList.remove('dragging');
                });

                // Lisa kliki kuulaja omaduste muutmiseks
                component.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectComponent(component);
                });

                // Lisa kustutamise nupp
                component.appendChild(deleteButton);
                
                // Lisa komponent preview alasse
                previewArea.appendChild(component);
            });

            // Lisa lohistamise funktsioonid preview alale
            previewArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = getDragAfterElement(previewArea, e.clientY);
                const draggable = document.querySelector('.dragging');
                if (draggable) {
                    if (afterElement) {
                        previewArea.insertBefore(draggable, afterElement);
                    } else {
                        previewArea.appendChild(draggable);
                    }
                }
            });
        });
    });

    // Lisa abifunktsioon elementide järjestamiseks
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

    // Lisa CSS klass dragging elemendile
    function addDraggingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .preview-component.dragging {
                opacity: 0.5;
                border: 2px dashed var(--brand-color);
            }
        `;
        document.head.appendChild(style);
    }

    // Kutsu välja stiilide lisamine
    addDraggingStyles();
}); 