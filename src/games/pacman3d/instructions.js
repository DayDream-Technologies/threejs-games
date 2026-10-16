/**
 * 3D maze chase instructions
 */

export const getInstructions = () => ({
  objective: 'Eat every pellet in the 3D maze. Power pellets frighten the pursuers so you can catch them. You have three lives.',
  controls: [
    'Arrow keys: move on X and Z',
    'Q / E: move up / down on Y',
    'P: Pause / Resume',
    'Mouse drag: orbit the camera'
  ],
  tips: [
    'The next turn queues until the corridor opens',
    'Press the opposite direction to turn around immediately',
    'One pursuer aims ahead of you; the others chase your cell',
    'Frightened pursuers are blue and slower'
  ]
});
