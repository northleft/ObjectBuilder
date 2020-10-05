

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
  let colors = [
    '#ace8dc',
    '#b5eecd',
    '#b7dbf3',
    '#ddc5e7',
    '#b8bfc7',
    '#faeba6',
    '#f6d2ae',
    '#f8c1ba',
    '#f9fbfa',
    '#dbe1e1'
  ];

  function init(){
    let style = '';

    colors.map(function(color, index){
      //style += 'ob-container ob.ob' + index + ',ob-container ob.ob' + ((index - 1 + colors.length) % colors.length) + ' object-container:before{background:' + color + ';}'
      style += 'ob-container ob.ob' + index;
      style += '{background:' + color + ';}';

      //let previousIndex = (index - 1 + colors.length) % colors.length;
      //style += 'ob-container ob.ob' + previousIndex + ' object-container:before,';
      //style += 'ob-container ob.ob' + previousIndex + ' object-container:after';
      //style += '{background:' + color + ' linear-gradient(90deg, rgba(0, 0, 0, .2) 0%, rgba(0, 0, 0, .9) 100%) top left/100% 100% no-repeat;}';
    });
    $('body').append('<style id="ob-style">' + style + '</style>');
    

    $('key').each(function(){
      let key = $(this);

      let valueEl = key.children('value');
      let labelEl = key.children('label');
      let value = valueEl.html() || key.attr('value') || (!valueEl.length && !labelEl.length ? key.html() : false) || 0;
      let type = $.trim(key.attr('type').toLowerCase());
      let name = labelEl.html() || key.attr('name') || false;
      
      let useLabels = ['string', 'float', 'integer', 'array', 'object-array', 'object', 'check', 'hex'].indexOf(type) > -1;
      let useValues = ['string', 'float', 'integer', 'hex'].indexOf(type) > -1;

      let labelHTML = '<label contenteditable autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">{{name}}</label>';
      let valueHTML = '<value contenteditable autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">{{value}}</value>';
      let openCloseButtonHTML = '<button action="open/close"><span></span></button>'
      let objectArrayAddButtonHTML = '<button add="{{key}}">Add {{key}}</button>';
      let objectContainerHTML = '<object-container></object-container>';
      let arrayAddButtonHTML = '<button add="item">+</button>';

      if (useValues){
        key.html('');
        key.append(valueHTML.replace(/{{value}}/g, value));
      }

      if (useLabels && name){
        key.prepend(labelHTML.replace(/{{name}}/g, name));
      }

      if (type == 'array'){
        valueEl
        .attr('contenteditable', true)
        .each(function(){
          let vel = $(this);
          if (!vel.attr('type')){
            vel.attr('type', 'string');
          }
        });
      }

      if (type == 'object-array'){
        let types = key.attr('types').split(',');
        let buttons = key.children('button[add]');

        types.map(function(item){
          item = $.trim(item);
          if (!buttons.filter('[add="' + item + '"]').length){
            key.append(objectArrayAddButtonHTML.replace(/{{key}}/g, item));
          }
        });
        
        if (!key.children('object-container').length){
          key.append(objectContainerHTML);
        }

        key.append(openCloseButtonHTML);
      }
    });


    let templates = {};
    let ob_templates = $('ob-templates');
    ob_templates.find('ob-setting').not('[ob-check]').attr('contenteditable', true);

    ob_templates.find('ob-array').prepend(OB.array_open).append(OB.array_container);

    ob_templates.children('[ob-type]').each(function(){
      let that = $(this);
      let type = that.attr('ob-type');
      let html = $('<div></div>').append(that.clone()).html();
      templates[type] = html;
    });

    OB.templates = templates;
    OB.container = $('ob-container');

    OB.container.on('click', 'ob > ob-label:first-child', function(){
      let that = $(this);
      let ob = that.closest('ob').eq(0);
      ob.toggleClass('ob-open').siblings().removeClass('ob-open');
    });

    OB.container.on('click', '[ob-button-delete]', function(){
      let that = $(this);
      that.closest('obj').remove();
    });

    OB.container.on('click', 'key[type="object-array"] > button[add]', function(){
      let that = $(this);
      let key = that.parent('key');
      let add = that.attr('add');
      if (OB.templates[add]){
        let container = key.children('object-container');
        container.append(OB.templates[add]);
        key.trigger('update').addClass('ob-open').siblings().removeClass('ob-open');
      } else {
        console.log('cannot find key:', add);
      }
    });

    OB.container.on('update', function(){
      OB.container.find('ob').removeClass('ob0 ob1 ob2 ob3 ob4 ob5 ob6 ob7 ob8 ob9').each(function(){
        let ob = $(this);
        $(this).addClass('ob' + (ob.parents('ob').length % colors.length));
      });
    }).on('build', function(){
      build();
    });

    OB.container.on('keydown', 'value', function(e){
      let that = $(this);
      let key = that.parent('key');
      let type = (that.attr('type') || key.attr('type')).toLowerCase();
      let useReturns = type == 'string';
      let useNumbers = ['float', 'number', 'integer'].indexOf(type) > -1;
      let isLetter = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(e.originalEvent.key) > -1;

      //let noLetters = 'abcdefghijklmnopqrstuvwxyz'.indexOf(e.originalEvent.key) > -1;
      
      if ((useNumbers && isLetter) || (!useReturns && e.originalEvent.key == 'Enter')){
        return false;
      }
    });

    //'blur keyup keydown paste copy cut mouseup'
    OB.container.on('blur paste validate', 'value', function(e){
      let value = $(this);
      let key = value.parent('key');
      let type = (value.attr('type') || key.attr('type')).toLowerCase();
      let val = value.text();
      let useNumbers = ['float', 'number', 'integer'].indexOf(type) > -1;

      if (type.indexOf('string') == -1){
        val = val.replace(/\r?\n|\r/g, '');
      }

      if (useNumbers){
        //val = val.replace(/[^a-zA-Z0-9 .,]|(?<!\\d)[.,]|[.,](?!\\d)/g, '');
        val.replace(/[^0-9.-]/g, '');
      }

      if (type == 'float'){
        val = parseFloat(val);
      }

      if (type == 'integer'){
        val = parseInt(val);
      }

      value.data('value', val).html(val);
      key.data('value', val);

    });

    OB.container.on('click', 'key[type="object-array"] > button[action="open/close"]', function(e){
      let that = $(this);
      let key = that.closest('key');
      let isopen = key.hasClass('ob-open');
      key.toggleClass('ob-open').siblings().removeClass('ob-open');

      if (!isopen){
        key.find('.ob-open').removeClass('ob-open');
      }
    });

    $(window).on('resize', function(){
      OB.container.find('ob').each(function(){
        let ob = $(this);
        ob.find('setting, setting label, setting value').removeAttr('style');
      });
    });

    //OB.container.on('open', 'key[type="object-array"]', function(e){
    //  e.stopImmediatePropagation();
    //  let that = $(this);
    //  let key = that.closest('key');
    //  key.addClass('ob-open').siblings().removeClass('ob-open');
    //}
    //OB.container.on('key', 'key[type="object-array"]', function(e){
    //  e.stopImmediatePropagation();
    //  let that = $(this);
    //  let key = that.closest('key');
    //  key.removeClass('ob-open').siblings().removeClass('ob-open');
    //}

  }

  function OB_addElement(type, container){
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
        type.trigger('update');
        console.log(type);
      } else {
        container.append(type.html());
      }
    } else {
      console.log('OB type not found: ' + type);
    }
  }

  function build(el){
    el = el || OB.container.children('ob:first-child');
    el.find('value').trigger('validate');
    let ret = {};
    el.children('key').each(function(){
      let key = $(this).trigger('validate');
      let type = key.attr('type');
      let name = key.attr('name');
      let standardTypes = ['float', 'string', 'integer', 'number', 'boolean'];

      if (standardTypes.indexOf(type) > -1){
        let val = key.find('value').data('value');
        ret[name] = key.data('value');
      }

      if (type == 'array'){
        let arr = [];
        key.find('value').each(function(){
          arr.push($(this).data('value'));
        });
        ret[name] = arr;
      }

      if (type == 'object'){
        let obj = {};
        key.find('key').each(function(){
          let k = $(this);
          let n = k.attr('name');
          let v = k.data('value');
          obj[n] = v;
        });
        ret[name] = obj;
      }

      if (type == 'object-array'){
        let arr = [];
        key.children('object-container').children('ob').each(function(){
          let ob = $(this);
          arr.push(build(ob));
        });
        ret[name] = arr;
      }
    });
    
    console.log(ret);

    return ret;
  }

  function build0(type){
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

  function ovalidate(type, val){

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

