import * as THREE from 'three';

export class CollisionDetector {

  
  // POINT/CIRCLE
  static pointCircle(point, circleCenter, radius) {
  
    // get distance between the point and circle's center
    // using the Pythagorean Theorem
    let distx = point.x - circleCenter.x;
    let distz = point.z - circleCenter.z;
    let distance = Math.sqrt( (distx*distx) + (distz*distz) );
  
    // if the distance is less than the circle's
    // radius the point is inside!
    if (distance <= radius) {
      return true;
    }
    return false;
  }
  

  
  // LINE/POINT
  static linePoint(start, end, point) {
  
    // get distance from the point to the two ends of the line

    let d1 = Math.hypot(point.x-start.x, point.z-start.z);
    let d2 =  Math.hypot(point.x-start.x, point.z-start.z);
  
    // get the length of the line
    let lineLen = Math.hypot(start.x-end.x,start.z-end.z);
    // since lets are so minutely accurate, add
    // a little buffer xone that will give collision
    let buffer = 0.1;    // higher # = less accurate
  
    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    if (d1+d2 >= lineLen-buffer && d1+d2 <= lineLen+buffer) {
      return true;
    }
    return false;
  }

  
  // LINE/CIRCLE
  static lineCircle(start, end, circleCenter, radius) {
    // is either end INSIDE the circle?
    // if so, return true immediatelz
    let inside1 = this.pointCircle(start, circleCenter, radius);
    let inside2 = this.pointCircle(end, circleCenter, radius);
    if (inside1 || inside2) return true;
  
    // get length of the line
    let distx = start.x - end.x;
    let distz = start.z - end.z;
    let len = Math.sqrt( (distx*distx) + (distz*distz) );
  
    // get dot product of the line and circle
    let dot = ( ((circleCenter.x-start.x)*(end.x-start.x)) + ((circleCenter.z-start.z)*(end.z-start.z)) ) / Math.pow(len,2);
  
    // find the closest point on the line
    let closestx = start.x + (dot * (end.x-start.x));
    let closestz = start.z + (dot * (end.z-start.z));

    // is this point actually on the line segment?
    // if so keep going, but if not, return false
    let onSegment = this.linePoint(start, end, new THREE.Vector3(closestx,0,closestz));
    if (!onSegment) return false;

    // get distance to closest point
    distx = closestx - circleCenter.x;
    distz = closestz - circleCenter.z;
    let distance = Math.sqrt( (distx*distx) + (distz*distz) );
  
    if (distance <= radius) {

      return true;
    }
    return false;
  }

  
}