export { Stack }

class Stack {
    constructor() {
        this.size = 0;
        this.Stack = [];
        this.buffer = 4;
    }

    clear() {
        this.size = 0;  // size 0 matlab sare elements ko remove kry gye 
        this.Stack = []; // Purani values hatany ky lye 
    }

    isEmpty() {
        return (this.size === 0);
    }

    top() {
        return this.Stack[this.size - 1]; // return the top most value 
    }

    condition() {
        if (!this.isEmpty()) {
            this.size--;
            return this.Stack[this.size]; // Return the new top element after decrement
        } else {
            return [-1, ''];
        }
    }

    push(type, char) {
        if (this.isEmpty()) {
            if (type === 0) {
                this.Stack.push([type, char]);
            } else {
                let tmp = this.top();
                if (tmp[0] === type && tmp[1].length < this.buffer) {
                    let top = this.condition();
                    top[1] = char + top[1];
                    this.Stack.push(top);
                } else {
                    this.Stack.push([type, char]);
                }
            }
            this.size++; 
        }

        // Make sure to export the Stack class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stack;
}
    }
}