/** An indexed priority queue built using an array based heap. Lower values are considered higher priority. */
export class PriorityQueue<Type> {
    private readonly heap: QueueItem<Type>[];
    private itemIndex: Map<Type, number>; //maps a item value to its index in the heap array

    constructor() {
        this.heap = [];
        this.itemIndex = new Map<Type, number>();
    }

    /**
     * adds item to priority queue. If value already exists, priority is updated.
     * @param value - the value to store in the queue.
     * @param {number} priority - Priority of the value. Lower number -> higher priority.
     */
    push(value: Type, priority: number): void {
        let index = this.itemIndex.get(value);

        if (index) {
            let oldPriority = this.heap[index].priority;
            this.heap[index].priority = priority;

            if (priority < oldPriority) this.swapUp(index);
            else this.swapDown(index);
        } else {
            let item = new QueueItem<Type>(value, priority);
            this.heap.push(item);
            this.swapUp(this.heap.length - 1);
        }
    }

    /**
     * @return - returns the highest priority item in the queue (the item ith the lowest priority, is considered
     *           highest priority) or undefined if queue is empty.
     */
    pop(): Type | undefined {
        if (this.heap.length > 1) {
            let min = this.heap[0];

            this.heap[0] = <QueueItem<Type>>this.heap.pop(); //will always be node since array length > 1
            this.itemIndex.set(this.heap[0].value, 0);
            this.itemIndex.delete(min.value);
            this.swapDown(0);

            return min.value;
        } else if (this.heap.length === 1) {
            let min = <QueueItem<Type>>this.heap.pop(); // will always be node since array contains 1 node

            this.itemIndex.delete(min.value);

            return min.value;
        } else return undefined;
    }

    private swapUp(index: number) {
        let currIndex = index;
        let parentIndex = PriorityQueue.getParentIndex(currIndex);
        let item = this.heap[currIndex];
        let parent = this.heap[parentIndex];

        while (parent.priority > item.priority) {
            this.swap(currIndex, parentIndex);

            currIndex = parentIndex;
            parentIndex = PriorityQueue.getParentIndex(currIndex);
            parent = this.heap[parentIndex];
        }
    }

    private swapDown(index: number) {
        let currIndex = index;
        let leftIndex = PriorityQueue.getLeftChildIndex(currIndex);
        let rightIndex = PriorityQueue.getRightChildIndex(currIndex);

        while (true) {
            let currItem = this.heap[currIndex];
            let leftItem = this.heap[leftIndex];
            let rightItem = this.heap[rightIndex];

            if (leftItem !== undefined && rightItem !== undefined) {
                if (leftItem.priority < rightItem.priority && leftItem.priority < currItem.priority) {
                    this.swap(leftIndex, currIndex);

                    currIndex = leftIndex;
                    leftIndex = PriorityQueue.getLeftChildIndex(currIndex);
                    rightIndex = PriorityQueue.getRightChildIndex(currIndex);
                } else if (rightItem.priority < currItem.priority) {
                    this.swap(rightIndex, currIndex);

                    currIndex = rightIndex;
                    leftIndex = PriorityQueue.getLeftChildIndex(currIndex);
                    rightIndex = PriorityQueue.getRightChildIndex(currIndex);
                } else {
                    break;
                }
            } else if (leftItem !== undefined && leftItem.priority < currItem.priority) {
                this.swap(leftIndex, currIndex);
                break;
            } else {
                break;
            }
        }

    }

    private swap(index1: number, index2: number) {
        let tempItem = this.heap[index1];

        this.heap[index1] = this.heap[index2];
        this.heap[index2] = tempItem;

        this.itemIndex.set(this.heap[index1].value, index1);
        this.itemIndex.set(this.heap[index2].value, index2);
    }

    private static getParentIndex(index: number): number {
        return index === 0 ? 0 : Math.floor((index - 1) / 2);
    }

    private static getLeftChildIndex(index: number): number {
        return (2 * index) + 1;
    }

    private static getRightChildIndex(index: number): number {
        return (2 * index) + 2;
    }
}

/**
 * A class representing an item in a priority queue.
 *
 * @property {number} priority - the priority value of this item.
 * @property value - the associated value of this item.
 */
class QueueItem<Type> {
    priority: number;
    value: Type;

    constructor(value: Type, priority: number) {
        this.value = value;
        this.priority = priority;
    }
}
