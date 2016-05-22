This is my final project for GA WDI

The reason that I chose to do this project is that I wanted to work with Three.js and with accellerometer controls on the mobile.

So this project creates 6 x 3D maps attached to each side of a cube, the user can rotate the cube using either key or mouse controls on a computer or the accellerometer controls on the phone, which will call the ball to roll around the maze and ultimately to the goal.

The key things to overcome where:
- understanding and using accellerometer controls, mouse controls and key controls
- understanding and using Three.js
- understanding and using a physics library, in this case Cannon.js*

* note I originally tried to use OIMO.js as my physics library but ran into a lot of issues so change to cannon.js which worked much better
 
Getting Three.js and Cannon.js to work together was one of the key difficulties of the project.
When creating an object, for example the ball, you need to create the ball element in both the Three.js & Cannon.js 'worlds'.
The Three.js world's ball shows the rendered ball, and the cannon.js worlds' ball has the physics applied to it, in this case gravity.
So the next step is linking the two balls, so on every animate frome we check the position of the physics ball and update the render ball of its position.

The Board posed more difficulties in linking.
Because the board contains many elements, this creates a lot of moving parts to track and given 3d rotation can be very difficult.
Fortunately three.js has a grouping function called object.3d where I was able to create a singular object which contains all sub-elements
So on each animate frame change, we check the change in position and rotation of the board group, get the position and rotation each sub element and update the corresponding physics sub element.

Moving from one side to the next.
moving from one side to the next was difficult for two reasons, making sure the ball didn't fall off into the abyss and the pivot point of the side
to stop the ball falling I decided to move the cube and rotate it so that the ball essentially falls off the old side and lands on the new side after being rotated and repositioned 
(down the track I would like to animate this change a little better by pausing the ball, slowly rotating the cube so that the user sees the change rather than an instantaneous change)
The pivot point needs to be the centre of the side the ball is rolling on, so this changes once you are on the new side.
The only way that I was able to do this was to create a new object.3d group with each subelement positioned relative to the new pivot point - this resulted in 6 grouping objects (one for each side), and so these are switched on/off once the ball goes to the next side
Another issue that arose here is that the controls that move the ground are set based upon the original position of the object so when it is rotated to be under the ball, this changes the allignment of the controls so these need to be manually adjusted for each side.



