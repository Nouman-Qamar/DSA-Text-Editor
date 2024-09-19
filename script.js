document.addEventListener('DOMContentLoaded', () => {
    const inputTextarea = document.getElementById('input');
    const outputTextarea = document.getElementById('output');
    const undoBtn = document.getElementById('undo-btn');
    const resetBtn = document.getElementById('reset-btn');

    const stack = new Stack();

    inputTextarea.addEventListener('input', (e) => {
        const inputText = e.target.value;
        const lastChar = inputText[inputText.length - 1];
        
        if (lastChar) {
            stack.push(lastChar);
            updateOutput();
        }
        
        undoBtn.disabled = false;
    });

    undoBtn.addEventListener('click', () => {
        if (!stack.isEmpty()) {
            stack.pop();
            inputTextarea.value = inputTextarea.value.slice(0, -1);
            updateOutput();
        }
        
        if (stack.isEmpty()) {
            undoBtn.disabled = true;
        }
    });

    resetBtn.addEventListener('click', () => {
        stack.clear();
        inputTextarea.value = '';
        updateOutput();
        undoBtn.disabled = true;
    });

    function updateOutput() {
        outputTextarea.value = stack.print();
    }
});