AFRAME.registerComponent("cursor-debugger", {
    init: function () {
        let text = document.createElement("a-text")
        text.setAttribute("color", "black")
        text.setAttribute("position", "-0.25 0.75 0")
        text.setAttribute("value", "cursor debbuger")

        this.mouseleave = this.printAction.bind(this, text, "mouseleave")
        this.mouseenter = this.printAction.bind(this, text, "mouseenter")
        this.mouseclick = this.printAction.bind(this, text, "click")

        this.clickbox = this.clickbox.bind(this, this.el);

        this.el.addEventListener("click", this.clickbox)
        this.el.addEventListener("click", this.mouseclick)
        this.el.addEventListener("mouseenter", this.mouseenter)
        this.el.addEventListener("mouseleave", this.mouseleave)
        this.el.appendChild(text);
    },
    printAction: function(el, text) {
        el.setAttribute("value", text)
    },
    clickbox: (function() {
        const colors = ["gray", "red", "blue", "yellow", "green"]
        let index = 0;
        return function(el) {
            el.setAttribute("color", colors[index++])
            if (index == colors.length -1) {
                index = 0;
            }
        }
    })(),
    remove: function() {
        this.el.removeEventListener("click", this.clickbox)
        this.el.removeEventListener("click", this.mouseclick)
        this.el.removeEventListener("mouseenter", this.mouseenter)
        this.el.removeEventListener("mouseleave", this.mouseleave)
    }
})