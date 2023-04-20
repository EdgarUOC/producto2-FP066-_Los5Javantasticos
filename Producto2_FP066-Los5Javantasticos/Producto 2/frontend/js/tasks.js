var tasksData;

function refreshTasks() {
  fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          tasks {
            id
            yearweek
            dayofweek
            name
            description
            color
            time_start
            time_end
            finished
            priority
          }
        }
      `,
    }),
  })
  .then((response) => response.json())
  .then((data) => {
    tasksData = data.data.tasks;
    drawTasks(tasksData);
  });
}

function drawTasks(tasks) {
  // vaciamos el html de semanas
  emptyTasks();
  // insertamos las tasks
  $.each(tasks, function(index, task) {
      drawTask(index,task);
  });
  draganddrop();
}

function drawTask(index,task) {
  // construimos el portlet de la tarea
  var item = $('<div class="portlet" data-id="'+task.id+'"><div class="portlet-header" style="background-color: '+task.color+'">'+task.name+'</div><div class="portlet-content">'+task.description+'<br><button onclick="drawModalTask('+index+')" type="button" class="btn-task-edit btn btn-success"><i class="fa fa-edit" aria-hidden="true"></i></button><button  data-bs-toggle="modal" href="#eliminar-task-'+task.id+'" type="button" class="btn-task-edit btn btn-danger"><i class="fa fa-trash-alt" aria-hidden="true"></i></button></div></div><div class="modal" tabindex="-1" id="eliminar-task-'+task.id+'"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Eliminar Tarea '+task.name+'</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p>¿Estás seguro que quieres eliminar la tarea ?</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button type="button" onclick="removeTask(\''+task.id+'\')" class="btn btn-primary">Sí</button></div></div></div></div>');
  // si no tiene semana asignada lo insertamos en tareas pendientes de asignar
  if( !task.yearweek ) {
    item.appendTo('#tasks-pending');
  // si la semana es la seleccionada insertamos las tareas en los dias de la semana
  } else if( $('#select-semana').val() == task.yearweek ) {
    item.appendTo('#tasks-week #day-'+task.dayofweek);
  }
}

function removeTask(id) {

  const deleteTaskQuery = `
      mutation {
          deleteTask(id: "${id}") {
              id
              yearweek
              dayofweek
          }
      }
  `;

  fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  },
  body: JSON.stringify({ query: deleteTaskQuery }),
  })
  .then((response) => response.json())
  .then((data) => {
      const deletedTask = data.data.deleteTask;
      console.log('Tarea eliminada:', deletedTask);
      refreshTasks();
  })
  .catch((error) => {
      console.error('Error al eliminar la tarea:', error);
  });

  $('#eliminar-task-'+id).remove();
  $('.modal-backdrop.show').remove();
  return;
}

function emptyTasks() {
  $('#tasks-pending').empty();
  $('#tasks-week .portlet').remove();
}

// Drag and Drop
function draganddrop() {
  
  $( ".column" ).sortable({
    connectWith: ".column",
    handle: ".portlet-header",
    cancel: ".portlet-toggle",
    placeholder: "portlet-placeholder ui-corner-all",
    update: function( event, ui ) {
      var changeTaskId = ui.item[0].dataset.id;
      var changeTaskIdParent = ui.item[0].parentElement.id;
      var changeTaskYearWeek = '';
      var changeTaskDayofWeek = '';
      if( changeTaskIdParent.startsWith('day-') ) {
        changeTaskYearWeek = $('#select-semana').val();
        changeTaskDayofWeek = parseInt(changeTaskIdParent.split('-')[1]);
      }
      updateTaskSorting(changeTaskId,changeTaskYearWeek,changeTaskDayofWeek);
    }
  });

  $( ".portlet" )
    .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
    .find( ".portlet-header" )
    .addClass( "ui-widget-header ui-corner-all" )
      

  $( ".portlet-toggle" ).click(function() {
    var icon = $( this );
    icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
    icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
  });

}

// actualiza la semana y dia de la semana para una tarea por su id
function updateTaskSorting(id,yearweek,dayofweek) {
  var task = tasksData.find((task) => task.id === id);
  console.log(task);
  if( task.id ) {
    task.yearweek = yearweek;
    task.dayofweek = dayofweek.toString();
    
    fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation UpdateTask(
          $id: ID!
          $yearweek: String!
          $dayofweek: String!
          $name: String!
          $description: String!
          $color: String!
          $time_start: String!
          $time_end: String!
          $finished: Int!
          $priority: Int!
        ) {
          updateTask(
            id: $id,
            yearweek: $yearweek
            dayofweek: $dayofweek
            name: $name
            description: $description
            color: $color
            time_start: $time_start
            time_end: $time_end
            finished: $finished
            priority: $priority
          ) {
            id
            yearweek
            dayofweek
            name
            description
            color
            time_start
            time_end
            finished
            priority
          }
        }`,
        variables: task,
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      refreshTasks();
    });
    
  }
}

function drawModalTask(index, yearweek = '', dayofweek = '') {

  // inicializamos valores
  var task = new Object();
  task.id = '';
  task.yearweek = yearweek;
  task.dayofweek = dayofweek;
  task.name = '';
  task.description = '';
  task.color = '#cccccc';
  task.time_start = '';
  task.time_end = '';
  task.finished = 0;
  task.priority = '';
  var title = 'Añadir ';

  // si viene definido un indice de semana cargaos sus datos
  if( index && typeof tasksData[index] != 'undefined' ) {
      var task = tasksData[index];
      var title = 'Ver/Editar ';
  }

  // preparamos opciones de los select
  var selected = '';
  // priority
  var options_priority = '';
  for (var i=1; i<=5; i++) {
      selected = '';
      if( i == task.priority ){ 
          selected = 'selected'; 
      }
      options_priority += '<option value='+i+' '+selected+'>'+i+'</option>';
  }

  // preparamos html de cada campo del formulario
  var fields_hidden = '<input id="id" name="id" type="hidden" value="'+task.id+'"><input id="yearweek" name="yearweek" type="hidden" value="'+task.yearweek+'"><input id="dayofweek" name="dayofweek" type="hidden" value="'+task.dayofweek+'">';
  var field_name = '<label for="name" class="form-label">Nombre tarea</label><input type="text" class="form-control" id="name" name="name" value="'+task.name+'" required>';
  var field_description = '<label for="description" class="form-label">Descripción</label><textarea type="description" class="form-control" id="description" name="description" title="Descripción">'+task.description+'</textarea>';
  var field_color = '<label for="color" class="form-label">Color</label><input type="color" class="form-control form-control-color" id="color" name="color" value="'+task.color+'" title="Elige el color">';
  var field_time_start = '<label for="time_start" class="form-label">Hora inicio</label><input type="time" class="form-control" id="time_start" name="time_start" value="'+task.time_start+'">';
  var field_time_end= '<label for="time_end" class="form-label">Hora final</label><input type="time" class="form-control" id="time_end" name="time_end" value="'+task.time_end+'">';
  var field_finished = '<div class="form-check"><input class="form-check-input" type="checkbox" value="1" id="finished" name="finished"><label class="form-check-label" for="finished">Finalizada</label></div>';
  var field_priority = '<label for="priority" class="form-label">Prioridad</label><select id="priority" name="priority" class="form-select" aria-label="Prioridad" required><option value="">Selecciona Prioridad</option>'+options_priority+'</select>';

  // preparamos html del formulario con los campos
  var formHtml = '<div class="modal" tabindex="-1" id="modal-tarea"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">'+title+' tarea</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><form id="tarea-form" class="needs-validation"><div class="modal-body">'+fields_hidden+'<div class="mb-3">'+field_name+'</div><div class="mb-3">'+field_description+'</div><div class="mb-3">'+field_color+'</div><div class="mb-3 row"><div class="col-6">'+field_time_start+'</div><div class="col-6">'+field_time_end+'</div></div><div class="mb-3">'+field_priority+'</div><div class="mb-3">'+field_finished+'</div></div><div class="modal-footer"><button id="modal-tarea-button" type="submit" class="btn btn-primary">Guardar</button></div></form></div></div></div>';
  
  // borramos el formulario si existe y lo insertamos en el DOM
  $('#modal-tarea').remove();
  $(formHtml).appendTo('#tasks-list');

  // añadimos el listener al evento de enviar el formulario para validar
  var form = document.getElementById("tarea-form");
  form.addEventListener('submit', function (event) {
    // validamos el formulario
    if (!form.checkValidity()) {
        // si no valida detenemos acción
        event.preventDefault();
        event.stopPropagation();
    }

    // si valida añadirmos campos validados
    form.classList.add("was-validated");

    // recogemos los datos del formulario
    var values = {};
    values['finished'] = 0;
    $.each($('#tarea-form').serializeArray(), function(i, field) {
        if (['finished','priority'].includes(field.name)) {
            values[field.name] = parseInt(field.value);
        } else {
            values[field.name] = field.value;
        }
    });

    console.log('=========');
    console.log(values);
    console.log('=========');

    var newIndice = values['id'];

    // creamos la tarea si no existe
    if( newIndice == '' ) {
      fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation CreateTask(
            $yearweek: String!
            $dayofweek: String!
            $name: String!
            $description: String!
            $color: String!
            $time_start: String!
            $time_end: String!
            $finished: Int!
            $priority: Int!
          ) {
            createTask(
              yearweek: $yearweek
              dayofweek: $dayofweek
              name: $name
              description: $description
              color: $color
              time_start: $time_start
              time_end: $time_end
              finished: $finished
              priority: $priority
            ) {
              yearweek
              dayofweek
              name
              description
              color
              time_start
              time_end
              finished
              priority
            }
          }`,
          variables: values,
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        refreshTasks(tasksData);
      });
    // o la actualizamos
    } else {
      fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation UpdateTask(
            $id: ID!
            $yearweek: String!
            $dayofweek: String!
            $name: String!
            $description: String!
            $color: String!
            $time_start: String!
            $time_end: String!
            $finished: Int!
            $priority: Int!
          ) {
            updateTask(
              id: $id,
              yearweek: $yearweek
              dayofweek: $dayofweek
              name: $name
              description: $description
              color: $color
              time_start: $time_start
              time_end: $time_end
              finished: $finished
              priority: $priority
            ) {
              id
              yearweek
              dayofweek
              name
              description
              color
              time_start
              time_end
              finished
              priority
            }
          }`,
          variables: values,
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        refreshTasks(tasksData);
      });
    }
    

    // y cerrará el modal
    event.preventDefault();
    event.stopPropagation();
    $('#modal-tarea').modal('hide');
    $('.modal-backdrop.show').remove();
    
  }, false);

  // abrimos el modal
  $('#modal-tarea').modal('show');

}

jQuery( document ).ready(function() {
  // coge los datos de tasks e inserta las tasks en el DOM
  refreshTasks(tasksData);
});
// cada vez que se cambie la semana refrescaremos las tareas
$( "#select-semana" ).change(function() {
  refreshTasks(tasksData);
});