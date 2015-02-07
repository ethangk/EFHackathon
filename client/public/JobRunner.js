var socket = io('http://localhost:12345');

console.log("running job runner");

var runningJobs = {};

socket.on('connect', function(){
  console.log("connection received");
});

socket.on('initTask', function(task) {
  console.log("new task received " +  JSON.stringify(task));
  runningJobs[task.taskId] = task; // new task to work on
});

socket.on('taskPiece', function(taskPiece) {
  console.log("job received " +  JSON.stringify(taskPiece));

  var task = runningJobs[taskPiece.taskId];
  if (task !== undefined) {
    var worker = new Worker("Worker.js"); 
    worker.postMessage({code: task.code, data: taskPiece.data});
    worker.onmessage = function (r) {
      socket.emit('result',
                  {taskId: taskPiece.taskId, pieceId: taskPiece.pieceId, result: r.data})
      console.log("result is " + JSON.stringify(r));
    }
  } else {
    console.log("non-existing job for that piece. ignore");
  }

});

socket.on('disconnect', function(){
  console.log("disconnect happened");

});
