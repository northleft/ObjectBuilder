

(function(){
  const OB = {
    //array_open: '<ob-array-open></ob-array-open>',
    //array_container: '<ob-array-container></ob-array-container>',
    //check_html: '<ob-check></ob-check>',
    //delete: '<ob-delete></ob-delete>'
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

  function init(readyFunc){
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
      
      let useLabels = ['string', 'float', 'integer', 'array', 'object-array', 'object', 'bool', 'color', 'hex', 'select'].indexOf(type) > -1;
      let useValues = ['string', 'float', 'integer', 'color', 'hex'].indexOf(type) > -1;

      let labelHTML = '<label contenteditable autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">{{name}}</label>';
      let valueHTML = '<value contenteditable autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">{{value}}</value>';
      let boolHTML = '<bool></bool>';
      let openCloseButtonHTML = '<button action="open/close"><span></span></button>'
      let objectArrayAddButtonHTML = '<button add="{{key}}">Add {{key}}</button>';
      let objectContainerHTML = '<object-container></object-container>';
      let arrayAddButtonHTML = '<button add="item">+</button>';

      //if (useLabels){
      //  if (!name){
      //    key.html('');
      //  }
      //  key.append(valueHTML.replace(/{{value}}/g, value));
      //}

      key.html('');

      if (useValues){
        //key.html('');
        key.append(valueHTML.replace(/{{value}}/g, value));
      }

      if (useLabels && name){
        key.prepend(labelHTML.replace(/{{name}}/g, name));
      }

      if (type == 'bool'){
        value = ['1', 'true'].indexOf(value.toLowerCase()) > -1 ? 1 : 0;
        key.attr('value', value).append(boolHTML);
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

      if (type == 'select'){
        let optionHTML = '';
        
        key.attr('values').split(' ').map(function(option, index){
          optionHTML += '<option value="{{option}}">{{option}}</option>'.replace(/{{option}}/g, option);
        });
        
        key.append('<select><option value="">Select</option>{{options}}</select>'.replace(/{{options}}/g, optionHTML));
      }
    });

    let templates = {};
    let ob_templates = $('ob-templates');
    ob_templates.find('ob-setting').not('[ob-check]').attr('contenteditable', true);

    ob_templates.find('ob-array').prepend(OB.array_open).append(OB.array_container);

    ob_templates.children('[type]').each(function(){
      let that = $(this);
      let type = that.attr('type');
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

    OB.container.on('wheel', 'key[type="integer"] value', function(e){
      let that = $(this);
      let value = parseInt(that.text()) + (e.originalEvent.deltaY < 0 ? -1 : 1);
      that.text(value).trigger('validate');
    });

    OB.container.on('click', 'key[type="bool"]', function(){
      let that = $(this);
      let value = that.attr('value');
      value = value == '1' || value == 'true' ? '0' : '1';
      that.attr('value', value).data('value', value == '1' ? true : false);
    });

    OB.container.on('click', 'key[type="object-array"] > button[add]', function(){
      let that = $(this);
      let key = that.parent('key');
      let add = that.attr('add');
      if (OB.templates[add]){
        let container = key.children('object-container');
        $(OB.templates[add]).addClass('ob-open').appendTo(container);
        key.trigger('update').addClass('ob-open').siblings().removeClass('ob-open');
      } else {
        console.log('cannot find key:', add);
      }
    });

    OB.container.on('update', 'key[type="object-array"]', function(){
      let that = $(this);
      let container = that.find('object-container');
      let obs = container.find('ob');
      if (obs.length == 0){
        that.removeClass('ob-open');
      }
    });

    OB.container.on('click', ':not(.ob-quick) button[action="delete"]', function(){
      let that = $(this);
      let container = that.closest('key');
      if (container.length == 0){
        container = that.closest('ob-container');
      }
      that.closest('ob').remove();
      container.trigger('update')
    });

    OB.container.on('click', ':not(.ob-quick) button[action="build"]', function(){
      OB.build();
    });

    OB.container.on('click', '.ob-quick button[action]', function(){
      const that = $(this);
      const action = that.attr('action');
      const ob = that.closest('ob[type]');
      const obj = ob.data('obj');
      const doconfirm = that.is('[confirm]');

      if (doconfirm){
        if (confirm('Confirm ' + that.text() + '?') && obj[action]){
          obj[action]();
        }
      } else if (obj[action]){
        obj[action]();
      }
    });

    OB.container.on('click', '.ob-quick button[ob-action="update"]', function(){
      let that = $(this);
      let ob = that.closest('ob[type]');
      ob.find('value').each(function(){
        $(this).trigger('validate');
      });
      ob.trigger('update');
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
      let useErrors = ['color'];

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
      let hasError = false;
      let control = value.closest('ob[type]');
      let min = parseFloat(key.attr('min'));
      let max = parseFloat(key.attr('max'));

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

      if (useNumbers){
        if (min || min == 0){
          val = Math.max(min, val);
        }
        if (max || max == 0){
          val = Math.min(max, val);
        }
      }

      if (type == 'color'){
        let div = $('<div style="background-color:' + val + ';"></div>');
        if (div.css('background-color') == ''){
          hasError = true;
        }
        div.remove();
      }

      if (!hasError){
        value.data('value', val).html(val);
        key.data('value', val).attr('value', val);
      } else {
        key.addClass('ob-error');
      }
    });

    OB.container.on('keyup', 'value', function(e){
      let that = $(this);
      if (e.originalEvent.key == 'Enter'){
        that.trigger('validate').closest('ob[type]').trigger('update');
      }
    });

    OB.container.on('change', 'select', function(e){
      let that = $(this);
      let val = that.val();

      that.closest('key')
        .attr('value', val)
        .data('value', val)
        .closest('ob[type]')
        .trigger('update')
      ;
    });

    OB.container.on('validate', 'key[type="bool"]', function(e){
      key = $(this);
      let value = key.attr('value');
      value = value == '1' || value == 'true' || false;
      key.data('value', value).attr('value', value);
    });

    OB.container.on('click', 'key[type="object-array"] > button[action="open/close"]', function(e){
      let that = $(this);
      let key = that.closest('key');
      let isopen = key.hasClass('ob-open');
      let obs = key.find('ob');
      if (obs.length){
        key.toggleClass('ob-open').siblings().removeClass('ob-open');
        if (!isopen){
          key.find('.ob-open').removeClass('ob-open');
        }
      }
    });

    OB.container.on('validate', 'key', function(e){
      $(this).trigger('update');
    });

    OB.container.on('update', 'ob.ob-quick', function(){
      let that = $(this);
      let obj = that.data('obj');
      that.find('key').each(function(){
        let key = $(this);
        let name = key.attr('name');
        obj[name] = key.data('value'); 
      });
      if (obj.update){
        obj.update();
      }
    })

    OB.container.on('update', function(){
      OB.container.find('ob').removeClass('ob0 ob1 ob2 ob3 ob4 ob5 ob6 ob7 ob8 ob9').each(function(){
        let ob = $(this);
        $(this).addClass('ob' + (ob.parents('ob').length % colors.length));
      });
    }).on('build', function(){
      build();
    });

    $(window).on('resize', function(){
      OB.container.find('ob').each(function(){
        let ob = $(this);
        ob.find('setting, setting label, setting value').removeAttr('style');
      });
    });

    if (readyFunc){
      readyFunc();
    }
  }

  function OB_addElement(type, container){
    container = container || OB.container;
    if (OB.templates[type]){
      type = $(OB.templates[type]).addClass(ocl);
      
      type.children('ob-object').each(function(){
        let obj = $(this);
        let obtype = obj.attr('type');
        OB_addElement(obtype, obj);
      });

      if (container.prop('tagName').toLowerCase() != 'ob-object'){
        container.append(type.append(OB.delete));
        type.trigger('update');
        return type;
      } else {
        container.append(type.html());
      }
    } else {
      console.log('OB type not found: ' + type);
    }
  }

  function build(){

    function getObj(el){
      let ret = {
        _type: el.attr('type')
      };

      el.children('key').each(function(){
        let key = $(this);
        let type = key.attr('type');
        let name = key.attr('name');
        let standardTypes = ['float', 'string', 'integer', 'number', 'bool', 'color'];

        key.trigger('validate').find('key, value').trigger('validate');

        if (standardTypes.indexOf(type) > -1){
          ret[name] = key.data('value') || key.find('value').data('value') || false;
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
            arr.push(getObj($(this)));
          });
          ret[name] = arr;
        }
      });

      return ret;
    }

    let data = getObj(OB.container.children('ob:first-child'));

    if (OB.onBuild){
      OB.onBuild(data);
    }
  }

  function returnObj(ob){
    let ret = [];
    let array = ob.children('ob-array');

    ret.push(ob.attr('type'));

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

  function quick(template, obj, alwayson){
    alwayson = alwayson || false;
    removeQuicks();
    let ob = OB_addElement(template);
    
    ob.find('key').each(function(){
      let key = $(this);
      let name = key.attr('name');
      let type = key.attr('type');
      let value = obj[name];
      
      if (type == 'select'){
        let values = obj['_' + name + '_'];
        let select = key.find('select');

        if (values){
          select.empty().append('<option value="">Select</option>');
          values.map(function(option){
            select.append(
              '<option value="{{option}}">{{option}}</option>'.replace(/{{option}}/g, option)
            );
          });
        }

        select.val(value);
      }
      
      key.data('value', value).attr('value', value).find('value').text(value).trigger('validate');
    });

    ob
    .data('obj', obj)
    .addClass('ob-quick ob-' + (alwayson ? 'permanent' : 'temporary'));

    ob.find('[action]', function(){
      const that = $(this);
      const action = that.attr('action');

      that.on('click', function(){
        if (obj[action]){
          obj[action]();
        }
      })
    })

    return ob;
  }

  function removeQuicks(){
    OB.container.find('.ob-quick.ob-temporary').remove();
  }

  OB.init = init;
  OB.add = OB_addElement;
  OB.quick = quick;
  OB.removeQuicks = removeQuicks;
  OB.build = build;
  window.OB = OB;
})();

