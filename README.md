# Starlings
**Murmuration** refers to the phenomenon that results when hundreds, sometimes thousands, birds in a flock fly in swooping, intricately coordinated patterns through the sky. Starlings are migratory birds who show this phenomenon very well. To see it for yourself click [here](https://www.youtube.com/watch?v=V4f_1_r80RY).

## Boids

Boids is an artificial life program, developed by **Craig Reynolds** in 1986, which simulates the flocking behaviour of birds. His paper on this topic was published in 1987,can be found [here](https://www.red3d.com/cwr/papers/1999/gdc99steer.pdf).

The name "boid" corresponds to a shortened version of "bird-oid object", which refers to a bird-like object.

## Properties

Each boid has direct access to the whole scene's geometric description, but flocking requires that it reacts only to flockmates within a certain small neighborhood around itself. The neighborhood is characterized by a distance (measured from the center of the boid) and an angle (measured from the boid's direction of flight).

The basic flocking model consists of three simple steering behaviors which describe how an individual boid maneuvers based on the positions and velocities its nearby flockmates:
- Seperation.
- Alignment.
- Cohesion.

### Seperation

Each Boid **steers away from local flockmates** to avoid crowding each other. This is done to so that they do not hit each other and to prevent congestion.

### Cohesion

Each Boid **steers towards the average position of local flockmates** to be near each other in the flock. This is done to maintain closeness and prevent disbanding.

### Alignment

Each Boid **steers towards the average heading of local flockmates** to keep moving in the same direction. This is done so that no boid gets seperated fromthe flock.

## Built With

- JavaScript
- [P5.js](https://p5js.org/) Library

## Run the Implemention

Clone the repository and open index.html file. Click on screen to introduce a new obstace, drag to introduce new boids.

## Contributers

- Hardik Khichi (2016CS50404)


