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
   generaDB(); //carga módulo DB.
});
var inicio = function() {
   console.log('portada');
   muestra("#inicioC");
}
var cargaDatos = function() {
   console.log('carga datos');
   muestra("#datosC");
}
var syncMe= function() {
   console.log('sincroniza a internet');
   muestra("#syncC");
}
var muestra = function(que) { $(".contenido").hide(); $(que).show(); }
/*
* inserta un nuevo dato
*/
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
   if(mensaje!='') $("#estado").html(mensaje);
   //var tr = db.transaction(["datos"],"readwrite");
   //var store = transaction.objectStore("datos");
}
/* * {{{ generaDB, crea la db por primera vez o cuando se cambia de versión (1 inicial)
*/
var generaDB = function() {
   var db= indexedDB.open("tabla", 1);
   db.onupgradeneeded = function (e) {
      var active = db.result;
      var object = active.createObjectStore("datos", { keyPath : 'id', autoIncrement : true });
      object.createIndex('by_name', 'correo', { unique : true });
   };
   db.onsuccess = function (e) {
      console.log('base de datos cargada');
   };
   db.onerror = function (e) {
      console.log('error en la base de datos '+e);
   };
}
/* }}} */
