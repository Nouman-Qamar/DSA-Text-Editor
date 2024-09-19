class Stack {
    constructor() {
        this.size = 0;
        this.stack = [];
        this.buffer = 4;
    }

    clear() {
        this.size = 0;
        this.stack = [];
    }

    isEmpty() {
        return this.size === 0;
    }

    top() {
        return this.stack[this.size - 1];
    }

    pop() {
        if (!this.isEmpty()) {
            this.size--;
            return this.stack.pop();
        }
        return null;
    }

    push(char) {
        if (this.isEmpty() || this.top()[1].length >= this.buffer || this.top()[1][0] !== char) {
            this.stack.push([0, char]);
        } else {
            this.top()[1] = char + this.top()[1];
        }
        this.size = this.stack.length;
    }

    getStack() {
        return this.stack;
    }

    print() {
        let output = '';
        for (let i = this.size - 1; i >= 0; i--) {
            output += `On stack ${this.stack[i][0]},${this.stack[i][1]}\n`;
        }
        output += 'Output';
        return output;
    }
}

// Make sure to export the Stack class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stack;
}
