const { Machine, interpret } = require('xstate');
const fs = require('fs');

// Read SCXML from file
const scxml = fs.readFileSync('test2.scxml', 'utf-8');

// Create machine from SCXML
const machine = Machine(scxml);


// Convert machine to JSON format
const machineJson = machine.config;

// Write JSON to file
fs.writeFileSync('example-machine.json', JSON.stringify(machineJson, null, 2));


// // Create service to interpret the machine
// const service = interpret(machine);

// // Subscribe to state changes
// service.subscribe((state) => {
//   console.log('Current state:', state.value);
// });

// // Start the machine
// service.start();

// // Send events to the machine
// service.send('start'); // Should transition to "active"
// service.send('stop');  // Should transition back to "idle"
