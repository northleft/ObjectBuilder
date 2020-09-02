

(function(){
  let OB = {};

  function init(){
    let templates = {};
    $('ob-templates [ob-type]').each(function(){
      let that = $(this);
      let type = that.attr('ob-type');
      let html = $('<div></div>').append(that.clone()).html();
      templates[type] = html;
    });

    OB.templates = templates;
    OB.container = $('ob-container');

    // add to array objects
    OB.container.on('click', '[ob-array-add]', function(){
      let that = $(this);
      let type = that.attr('ob-array-add');
      let array = that.attr('ob-array-key');
      let ob = that.closest('ob').eq(0);
      let parent = ob.children('[ob-key="' + array + '"]');

      if (parent.length){
        let parentType = parent.prop('nodeName').toLowerCase();

        if (parentType == 'ob-object'){
          parent.empty();
        }
        
        parent.append(templates[type]);
      } else {
        console.log('ObjectBuilder: Array does not exist');
      }
    });

    OB.container.on('click', '[ob-build]', function(){
      let that = $(this);
      let type = that.attr('ob-button-build');
      OB.build(type);
    });

    OB.container.on('click', '[ob-button-delete]', function(){
      let that = $(this);
      that.closest('obj').remove();
    });
  }

  function OB_addElement(type, container){
    container = container || OB.container;
    if (OB.templates[type]){
      type = $(OB.templates[type]);
      
      let objects = type.find('[ob-object]');
      objects.each(function(){
        let that = $(this);
        OB_addElement(that.attr('[ob-type]'), that);
      })

      container.append(type);
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

