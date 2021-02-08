export class JointObject {
    constructor(id, num, parent) {
        this.id = id;
        this.num = num;
        this.parent = parent;
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

    getRawQuaternion(_quaternion) {
        return this.parent.getPoseQuaternion(this.num, _quaternion)
    }

    getQuaternion(_quaternion) {
        return this.parent.getOrientedQuaternion(this.num, _quaternion);
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