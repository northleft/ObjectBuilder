

(function(){
  let OB = {
    array_open: '<ob-array-open></ob-array-open>',
    array_container: '<ob-array-container></ob-array-container>',
    check_html: '<ob-check></ob-check>',
    delete: '<ob-delete></ob-delete>'
  };

  let obcount = 0;
  let obmax = 10;
  let ocl = 'ob-open';

  function init(){
    let templates = {};
    let ob_templates = $('ob-templates');
    ob_templates.find('ob-setting').not('[ob-check]').attr('contenteditable', true);

    ob_templates.find('[ob-check]').each(function(){
      let that = $(this);
      let check = (that.attr('ob-value') || that.html()).toLowerCase();
      check = check == '1' || check == 'true' || false;
      that.html(OB.check_html);
      //that.data('value', check);
      that.attr('ob-value', check);
    });

    ob_templates.find('ob-array').prepend(OB.array_open).append(OB.array_container);

    ob_templates.children('[ob-type]').each(function(){
      let that = $(this);
      let type = that.attr('ob-type');
      let html = $('<div></div>').append(that.clone()).html();
      templates[type] = html;
    });

    OB.templates = templates;
    OB.container = $('ob-container');

    OB.container.on('click', 'ob-array-open', function(){
      let that = $(this);
      let array = that.closest('ob-array').eq(0);

      if (!array.hasClass(ocl)){
        array.trigger('ob-array-open');
      } else {
        array.trigger('ob-array-close');
      }
    });

    OB.container.on('ob-array-open', 'ob-array', function(e){
      e.stopPropagation();
      let array = $(this);

      OB.container.find('.' + ocl).removeClass(ocl);
      array.addClass(ocl).parents('ob, ob-array').addClass(ocl);
    });

    OB.container.on('ob-array-close', 'ob-array', function(){
      let array = $(this);
      array.removeClass(ocl).find('.' + ocl).removeClass(ocl);
    });

    // add to array objects
    OB.container.on('click', '[ob-array-add]', function(e){
      let that = $(this);
      let type = that.attr('ob-array-add');
      let array = that.closest('ob-array');
      let container = array.children('ob-array-container');

      console.log('adding to array', type)

      OB_addElement(type, container);
      array.trigger('ob-array-open');
    });

    OB.container.on('click', '[ob-build]', function(){
      let that = $(this);
      let type = that.attr('ob-button-build');
      OB.build(type);
    });

    OB.container.on('click', 'ob > ob-label:first-child', function(){
      let that = $(this);
      let ob = that.closest('ob').eq(0);
      ob.toggleClass('ob-open');
    });

    OB.container.on('click', '[ob-button-delete]', function(){
      let that = $(this);
      that.closest('obj').remove();
    });
  }

  function OB_addElement(type, container){
    console.log(type, container);
    container = container || OB.container;
    if (OB.templates[type]){
      type = $(OB.templates[type]).addClass(ocl);
      
      type.children('ob-object').each(function(){
        let obj = $(this);
        let obtype = obj.attr('ob-type');
        OB_addElement(obtype, obj);
      });

      if (container.prop('tagName').toLowerCase() != 'ob-object'){
        container.append(type.append(OB.delete));
      } else {
        container.append(type.html());
      }
    } else {
      console.log('OB type not found: ' + type);
    }
  }

  function build(type){
    type = type || 'array';
    let data = null

    OB.container.find('ob-setting').each(function(){
      let that = $(this);
      let input = that.find('input');
      let type = input.attr('type');
      let value = input.val();
      let validate = that.attr('ob-input-validate');

      if (type == 'checkbox'){
        value = input.prop('checked') == true;
      }

      if (validate){
        switch(validate) {
          case 'float':
            value = parseFloat(value.replace(/[^0-9.+/-]+/gi, ''));
            break;
          case 'interger':
            value = parseInt(value) || 0
          default:
            // nothing
        }
      }

      that.data('ob-value', value);
    });

    if (type == 'array'){
      data = returnObj(OB.container.children('ob'));
    }

    OB.data = data;
    if (OB.onBuild){
      OB.onBuild(data);
    }
  }

  function returnObj(ob){
    let ret = [];
    let array = ob.children('ob-array');

    ret.push(ob.attr('ob-type'));

    ob.children('ob-setting').each(function(){
      ret.push($(this).data('ob-value'));
    });

    if (array.length){
      let carray = [];
      array.children('obj').each(function(){
        let that = $(this);
        carray.push(returnObj(that));
      });
      if (carray.length){
        ret.push(carray);
      }
    }

    return ret;
  }

  OB.init = init;
  OB.add = OB_addElement;
  OB.build = build;
  window.OB = OB;
})();

