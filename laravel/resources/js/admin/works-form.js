document.addEventListener('DOMContentLoaded', function () {
    const thumbnailInput = document.getElementById('thumbnail');
    if (thumbnailInput) {
        thumbnailInput.addEventListener('change', function () {
            const span = document.getElementById('thumbnail-name');
            if (this.files.length > 0) {
                const file = this.files[0];
                const sizeKB = (file.size / 1024).toFixed(1);
                span.textContent = '+ ' + file.name + ' (' + sizeKB + ' KB)';
                span.classList.remove('hidden');
            } else {
                span.classList.add('hidden');
            }
        });
    }

    const imagesInput = document.getElementById('images');
    if (imagesInput) {
        imagesInput.addEventListener('change', function () {
            const preview = document.getElementById('images-preview');
            preview.innerHTML = '';

            if (this.files.length === 0) {
                preview.classList.add('hidden');
                return;
            }

            preview.classList.remove('hidden');
            Array.from(this.files).forEach(function (file) {
                const li = document.createElement('li');
                li.className = 'bg-surface-secondary border border-border-subtle rounded p-3 space-y-2';

                const nameRow = document.createElement('p');
                nameRow.className = 'text-foreground-muted text-xs font-mono';
                const sizeKB = (file.size / 1024).toFixed(1);
                nameRow.textContent = '+ ' + file.name + ' (' + sizeKB + ' KB)';
                li.appendChild(nameRow);

                const input = document.createElement('input');
                input.type = 'text';
                input.name = 'captions[]';
                input.placeholder = 'caption (任意)';
                input.className = 'w-full bg-surface-primary border border-border-subtle rounded px-3 py-2 text-foreground-primary text-xs font-mono focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors';
                li.appendChild(input);

                preview.appendChild(li);
            });
        });
    }
});
