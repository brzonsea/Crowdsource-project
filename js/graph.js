const graph = new Dracula.Graph

graph.addEdge('Banana', 'Apple')
graph.addEdge('Apple', 'Kiwi')
graph.addEdge('Apple', 'Dragonfruit')
graph.addEdge('Dragonfruit', 'Banana')
graph.addEdge('Kiwi', 'Banana')

const layout = new Dracula.Layout.Spring(graph)
const renderer = new Dracula.Renderer.Raphael('#structure-map', graph, 400, 300)
renderer.draw()