export class JointObject {
    constructor(id, num, parent) {
        this.id = id;
        this.num = num;
        this.parent = parent;
    }

    getId() {
        return this.id
    }

    getPosition(_vector) {
        return this.parent.getPosition(this.num, _vector);
    }

    getDirection(_vector) {
        return this.parent.getDirection(this.num, _vector);
    }

    getNormal(_vector) {
        return this.parent.getNormal(this.num, _vector);
    }

    getQuaternion(_quaternion) {
        return this.parent.getQuaternion(this.num, _quaternion);
    }

    getRadius() {
        return this.parent.getRadius(this.num);
    }

    isValid() {
        return this.parent.getValidity(this.num);
    }

    /*
        Gesture helper API
                            */
    isCloserThan(other, distance) { }
    isTouchingJoint(other) { }
    isNearJoint(other) { }
    isSameDirection(other) { }
    isOppositeDirection(other) { }
    isHorizontal() { }
    isVertical() { }
    isUp() { }
    isDown() { }
}