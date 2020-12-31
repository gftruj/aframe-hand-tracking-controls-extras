export class JointObject {
    constructor(id, parent) {
        this.id = id;
        this.parent = parent;
    }

    getPosition(_vector) {
        return this.parent.getPosition(this.id, _vector);
    }

    getDirection(_vector) {
        return this.parent.getDirection(this.id, _vector);
    }

    getNormal(_vector) {
        return this.parent.getNormal(this.id, _vector);
    }

    getRawQuaternion(_quaternion) {
        return this.parent.getPoseQuaternion(this.id, _quaternion)
    }

    getQuaternion(_quaternion) {
        return this.parent.getOrientedQuaternion(this.id, _quaternion);
    }

    getRadius() {
        return this.parent.getRadius(this.id);
    }

    isValid() {
        return this.parent.getValidity(this.id);
    }

    /*
        Gesture helper API
                            */
    isTouchingJoint(other) { }
    isNearJoint(other) { }
    isSameDirection(other) { }
    isOppositeDirection(other) { }
    isHorizontal() { }
    isVertical() { }
    isUp() { }
    isDown() { }
}