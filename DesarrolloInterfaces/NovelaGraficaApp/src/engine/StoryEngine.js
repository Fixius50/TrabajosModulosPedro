export class StoryEngine {
  constructor(storyData) {
    this.data = storyData;
    this.currentNodeId = 'start';
    this.history = [];
    this.variables = {};
  }

  getCurrentNode() {
    return this.data.nodes[this.currentNodeId];
  }

  submitChoice(choiceIndex) {
    const node = this.getCurrentNode();
    if (node.type !== 'choice') {
      console.warn('Current node is not a choice node');
      return;
    }

    const option = node.options[choiceIndex];
    if (option) {
      this.transitionTo(option.target);
    }
  }

  transitionTo(nodeId) {
    if (this.data.nodes[nodeId]) {
      this.history.push(this.currentNodeId);
      this.currentNodeId = nodeId;
    } else {
      console.error(`Node ${nodeId} not found`);
    }
  }

  next() {
    const node = this.getCurrentNode();
    if (node.next) {
      this.transitionTo(node.next);
    }
  }

  reset() {
    this.currentNodeId = 'start';
    this.history = [];
  }
}
