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

    // Ülejäänud kood jääb samaks...
}); 