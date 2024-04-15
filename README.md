## Racing game made with three.js!
*Instructions*:
- You control the yellow car, and an AI controls the white car.
- The goals are marked in green or yellow. 
    - The green goal is the next one you need to reach. 
    - The yellow ones are locked later goals. After reaching the green goal, the next yellow one will be unlocked and turned to green.
- Speed buffs are marked in blue and they spawn on a random location every 7 seconds. Pick one up to gain a boost to acceleration and max speed!
- Drive your car using the controls below. The first car to reach all 4 goals wins!

*Controls*:
> Move vehicle: W-A-S-D

> Move camera: Hold LMB or RMB and move mouse to steer camera

*Implemented categories*:
- A **cellular automata** generates a random map.
- The NPC pathfinds to each goal using **A\*** (with some post-processing done to the path to improve the pathfollowing).
- The NPC pathfollows the A\* path using **Reynold's pathfollowing**.
- A **behavior tree** allows the NPC to run into (pursue) the player, run from (evade) the player, or just following the path.

---
```
Notes: 
The AI will more often than not get stuck on wall geometry. If I could have figured out a way to make the walls smoother, it would probably work way better. But also I didn't wanna use Dungeon Generation because I think it didn't really fit with the game style.

The NPC bumping and evading the player has no contribution to the game (yet, at least) because I couldn't program the physics between characters in time.

I implemented a Third person camera that *almost* worked well. It follows the player corretly at first but the rotation gets messed after a bit. It can be toggled with the on-screen button on the top corner.

I decided to leave the AI pathing indicator (the small dark yellow squares) on, to help seeing what the npc path is, since the npc will often get stuck on walls.
```