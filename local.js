$(function() {
   console.log('init');
   $(".boton").on("click",function() {
      id = $(this);
      if(id.attr('id') == 'inicio') inicio();
      else if(id.attr('id') == 'datos') cargaDatos();
      else if(id.attr('id') == 'sync') syncMe();
      else if(id.attr('id') == 'dosave') escribeDB();
      else {
         console.log('no se que quiere hacer');
      }
   });
   inicio(); //carga portada default
   DATA = indexedDB.open("tabla", 1);
   db=null;
   generaDB(); //carga módulo DB.
});
var inicio = function() {
   console.log('portada');
   muestra("#inicioC");
}
/* carga los datos almacenados localmente {{{ */
var cargaDatos = function() {
   console.log('carga datos');
   muestra("#datosC");
   $("#estado").html('');
   var res = db.transaction(["datos"],"readwrite").objectStore("datos");
   //var datas = [];
   var botija = $("#losdatos tbody");
   botija.html('');
   res.openCursor().onsuccess = function(e) {
      var cursor = e.target.result;
      if(cursor) {
         var tmp = '';
         //datas[cursor.key] = cursor.value;
         tmp = '<tr>';
            tmp += '<td>'+cursor.key+'</td>';
            tmp += '<td>'+cursor.value.name+'</td>';
            tmp += '<td>'+cursor.value.correo+'</td>';
            tmp += '<td>'+cursor.value.nacimiento+'</td>';
            tmp += '<td>'+cursor.value.sincronizado+'</td>';
            tmp += '<td>'+cursor.value.fecha+'</td>';
         tmp += '</tr>';
         botija.append(tmp);
         cursor.continue();
      }
   }
}
/* }}} */
var syncMe= function() {
   console.log('sincroniza a internet');
   muestra("#syncC");
   //
   var res = db.transaction(["datos"],"readonly").objectStore("datos");
   //console.log(res);
   res.openCursor().onsuccess = function(e) {
      var cursor = e.target.result;
      if(cursor) {
         if(cursor.value.sincronizado == '0' && navigator.onLine) {
            console.log('aaa');
            $("#estado").html('Enviando datos ');
            var orig = cursor.value;
            var oo = cursor;
            $.post("https://tar.mx/apps/local2mysql/api.php", { data: cursor.value } ,function(m) {
               console.log(m);
               if(m.id) {
                  $("#estado").append(m.lid+'=ok! ');
                  //updateID(m.lid, m);
                  //almacenamos
                  orig.sincronizado = m.id;
                  orig.fecha = m.fecha;
                  updateID(m.lid,orig);
               } else {
                  console.log('error db remota '+m.error);
                  $("#estado").html('error db remota '+m.error);
               }
            },'jsonp');
            cursor.continue();
         } else if(cursor) {
            cursor.continue();
         } else if(cursor.value.sincronizado == 0 && !navigator.onLine) {
            $("#estado").html('ERROR parece que no tiene internet');
         }
      } else {
         $("#estado").html('todo ok');
      }
   }
}
var updateID = function(id, update) {
   var rex = db.transaction(["datos"],"readwrite").objectStore("datos");
   var request = rex.get(id);
   request.onsuccess = function(event) {
      var ru = rex.put(update);
      ru.onsuccess = function(ee) {
         console.log(ee);
      }
      ru.onerror = function(ee) {
         console.log('no se pudo actualizar localmente');
      }
   }
}
var muestra = function(que) { 
   $(".contenido").hide(); $(que).show(); 
   $("#estado").html('');
}
/* * inserta un nuevo dato {{{ */
var escribeDB = function() {
   //comprobamos que estén llenos los datos, aqui inicialmente están "hardcoded" nombre, correo, nacimiento:
   var datos = ['nombre','correo','nacimiento'];
   var mensaje = '';
   $.each(datos,function(i,item) {
      var dato = $('input[name="'+item+'"]');
      // es requerido?
      if(dato.attr('required') !== undefined && dato.val() == '') {
         mensaje += item+" no puede ir vacío\n";
         console.log('item '+item+' es requerido! ');
      }
   });
   if(mensaje!='') { $("#estado").html(mensaje); }
   else {
      //almacenamos el dato.
      var tr = db.transaction(["datos"],"readwrite");
      var a = tr.objectStore("datos"); //lo que almacenaremos
      var dato = {
         name: $('input[name="nombre"]').val(),
         correo: $('input[name="correo"]').val(),
         nacimiento: $('input[name="nacimiento"]').val(),
         sincronizado: 0,
      }
      var req = a.add(dato);
      req.onerror = function(e) {
         $("#estado").html('ERROR :/ '+e.target.error);
         console.log(e.target.error);
      }
      req.onsuccess = function(e) {
         $("#estado").html('se almacenaron los datos :>');
         //limpiamos
         $.each(datos,function(i,item) {
            $('input[name="'+item+'"]').val('');
         });
      }
   }
}
/* }}} */
/* * {{{ generaDB, crea la db por primera vez o cuando se cambia de versión (1 inicial)
*/
var generaDB = function() {
   DATA.onupgradeneeded = function (e) {
      db= DATA.result;
      var object = db.createObjectStore("datos", { keyPath : 'id', autoIncrement : true });
      object.createIndex('by_name', 'correo', { unique : true });
   };
   DATA.onsuccess = function (e) {
      console.log('base de datos cargada');
      db= DATA.result; //asignamos la DB
   };
   DATA.onerror = function (e) {
      console.log('error en la base de datos '+e);
   };
}
/* }}} */
