(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/malinajs/runtime.js
  var current_destroyList;
  var current_mountList;
  var current_cd;
  var destroyResults;
  var $onDestroy = (fn) => fn && current_destroyList.push(fn);
  var __app_onerror = console.error;
  var isFunction = (fn) => typeof fn == "function";
  var isObject = (d) => typeof d == "object";
  var safeCall = (fn) => {
    try {
      return fn?.();
    } catch (e) {
      __app_onerror(e);
    }
  };
  var safeGroupCall = (list) => {
    try {
      list?.forEach((fn) => fn?.());
    } catch (e) {
      __app_onerror(e);
    }
  };
  var safeGroupCall2 = (list, resultList, onlyFunction) => {
    list?.forEach((fn) => {
      let r = safeCall(fn);
      r && (!onlyFunction || isFunction(r)) && resultList.push(r);
    });
  };
  function WatchObject(fn, cb) {
    this.fn = fn;
    this.cb = cb;
    this.value = NaN;
    this.cmp = null;
  }
  function $watch(fn, callback, option) {
    let w = new WatchObject(fn, callback);
    option && Object.assign(w, option);
    current_cd.watchers.push(w);
    return w;
  }
  function removeItem(array, item) {
    let i = array.indexOf(item);
    if (i >= 0)
      array.splice(i, 1);
  }
  function $ChangeDetector(parent) {
    this.parent = parent;
    this.children = [];
    this.watchers = [];
    this.prefix = [];
  }
  var cd_component = (cd) => {
    while (cd.parent)
      cd = cd.parent;
    return cd.component;
  };
  var cd_new = (parent) => new $ChangeDetector(parent);
  var cd_attach = (parent, cd) => {
    if (cd) {
      cd.parent = parent;
      parent.children.push(cd);
    }
  };
  var cd_detach = (cd) => removeItem(cd.parent.children, cd);
  var isArray = (a) => Array.isArray(a);
  var _compareDeep = (a, b, lvl) => {
    if (lvl < 0 || !a || !b)
      return a !== b;
    if (a === b)
      return false;
    let o0 = isObject(a);
    let o1 = isObject(b);
    if (!(o0 && o1))
      return a !== b;
    let a0 = isArray(a);
    let a1 = isArray(b);
    if (a0 !== a1)
      return true;
    if (a0) {
      if (a.length !== b.length)
        return true;
      for (let i = 0; i < a.length; i++) {
        if (_compareDeep(a[i], b[i], lvl - 1))
          return true;
      }
    } else {
      let set = {};
      for (let k in a) {
        if (_compareDeep(a[k], b[k], lvl - 1))
          return true;
        set[k] = true;
      }
      for (let k in b) {
        if (set[k])
          continue;
        return true;
      }
    }
    return false;
  };
  function cloneDeep(d, lvl) {
    if (lvl < 0 || !d)
      return d;
    if (isObject(d)) {
      if (d instanceof Date)
        return d;
      if (d instanceof Element)
        return d;
      if (isArray(d))
        return d.map((i) => cloneDeep(i, lvl - 1));
      let r = {};
      for (let k in d)
        r[k] = cloneDeep(d[k], lvl - 1);
      return r;
    }
    return d;
  }
  function deepComparator(depth) {
    return function(w, value) {
      let diff = _compareDeep(w.value, value, depth);
      diff && (w.value = cloneDeep(value, depth), !w.idle && w.cb(value));
      w.idle = false;
    };
  }
  var compareDeep = deepComparator(10);
  var keyComparator = (w, value) => {
    let diff = false;
    for (let k in value) {
      if (w.value[k] != value[k])
        diff = true;
      w.value[k] = value[k];
    }
    diff && !w.idle && w.cb(value);
    w.idle = false;
  };
  var fire = (w) => {
    let value = w.fn();
    if (w.cmp)
      w.cmp(w, value);
    else {
      w.value = value;
      w.cb(w.value);
    }
    return value;
  };
  function $digest($cd, flag) {
    let loop = 10;
    let w;
    while (loop >= 0) {
      let index = 0;
      let queue = [];
      let i, value, cd = $cd, changes = 0;
      while (cd) {
        for (i = 0; i < cd.prefix.length; i++)
          cd.prefix[i]();
        for (i = 0; i < cd.watchers.length; i++) {
          w = cd.watchers[i];
          value = w.fn();
          if (w.value !== value) {
            flag[0] = 0;
            if (w.cmp) {
              w.cmp(w, value);
            } else {
              w.cb(w.value = value);
            }
            changes += flag[0];
          }
        }
        if (cd.children.length)
          queue.push.apply(queue, cd.children);
        cd = queue[index++];
      }
      loop--;
      if (!changes)
        break;
    }
    if (loop < 0)
      __app_onerror("Infinity changes: ", w);
  }
  var templatecache = {};
  var createTextNode = (text) => document.createTextNode(text);
  var htmlToFragment = (html, option) => {
    let result = templatecache[html];
    if (!result) {
      let t = document.createElement("template");
      t.innerHTML = html.replace(/<>/g, "<!---->");
      result = t.content;
      if (!(option & 2) && result.firstChild == result.lastChild)
        result = result.firstChild;
      templatecache[html] = result;
    }
    return option & 1 ? result.cloneNode(true) : result;
  };
  var iterNodes = (el, last, fn) => {
    let next;
    while (el) {
      next = el.nextSibling;
      fn(el);
      if (el == last)
        break;
      el = next;
    }
  };
  var removeElements = (el, last) => iterNodes(el, last, (n) => n.remove());
  var resolvedPromise = Promise.resolve();
  function $tick(fn) {
    fn && resolvedPromise.then(fn);
    return resolvedPromise;
  }
  var current_component;
  var $context;
  var makeApply = () => {
    let $cd = current_component.$cd = current_cd = cd_new();
    $cd.component = current_component;
    let planned, flag = [0];
    let apply = (r) => {
      flag[0]++;
      if (planned)
        return r;
      planned = true;
      $tick(() => {
        try {
          $digest($cd, flag);
        } finally {
          planned = false;
        }
      });
      return r;
    };
    current_component.$apply = apply;
    current_component.$push = apply;
    apply();
    return apply;
  };
  var makeComponent = (init) => {
    return ($option = {}) => {
      $context = $option.context || {};
      let prev_component = current_component, prev_cd = current_cd, $component = current_component = { $option };
      current_cd = null;
      try {
        $component.$dom = init($option);
      } finally {
        current_component = prev_component;
        current_cd = prev_cd;
        $context = null;
      }
      return $component;
    };
  };
  var callComponent = (component, context, option = {}) => {
    option.context = { ...context };
    let $component = safeCall(() => component(option));
    if ($component instanceof Node)
      $component = { $dom: $component };
    return $component;
  };
  var callComponentDyn = (component, context, option = {}, propFn, cmp, setter, classFn) => {
    let $component, parentWatch;
    if (propFn) {
      parentWatch = $watch(propFn, (value) => {
        $component.$push?.(value);
        $component.$apply?.();
      }, { value: {}, idle: true, cmp });
      option.props = fire(parentWatch);
    }
    if (classFn) {
      fire($watch(classFn, (value) => {
        option.$class = value;
        $component?.$apply?.();
      }, { value: {}, cmp: keyComparator }));
    }
    $component = callComponent(component, context, option);
    if (setter && $component?.$exportedProps) {
      let parentCD = current_cd, w = new WatchObject($component.$exportedProps, (value) => {
        setter(value);
        cd_component(parentCD).$apply();
        $component.$push(parentWatch.fn());
        $component.$apply();
      });
      Object.assign(w, { idle: true, cmp, value: parentWatch.value });
      $component.$cd.watchers.push(w);
    }
    return $component;
  };
  var attachDynComponent = (label, exp, bind, parentLabel) => {
    let parentCD = current_cd;
    let destroyList, $cd, first;
    const destroy = () => safeGroupCall(destroyList);
    $onDestroy(destroy);
    $watch(exp, (component) => {
      destroy();
      if ($cd)
        cd_detach($cd);
      if (first)
        removeElements(first, parentLabel ? null : label.previousSibling);
      if (component) {
        destroyList = current_destroyList = [];
        current_mountList = [];
        $cd = current_cd = cd_new(parentCD);
        try {
          const $dom = bind(component).$dom;
          cd_attach(parentCD, $cd);
          first = $dom.nodeType == 11 ? $dom.firstChild : $dom;
          if (parentLabel)
            label.appendChild($dom);
          else
            label.parentNode.insertBefore($dom, label);
          safeGroupCall2(current_mountList, destroyList);
        } finally {
          current_destroyList = current_mountList = current_cd = null;
        }
      } else {
        $cd = first = destroyList = null;
      }
    });
  };
  var autoSubscribe = (...list) => {
    list.forEach((i) => {
      if (isFunction(i.subscribe)) {
        let unsub = i.subscribe(current_component.$apply);
        if (isFunction(unsub))
          $onDestroy(unsub);
      }
    });
  };
  var addStyles = (id, content) => {
    if (document.head.querySelector("style#" + id))
      return;
    let style = document.createElement("style");
    style.id = id;
    style.innerHTML = content;
    document.head.appendChild(style);
  };
  var makeBlock = (fr, fn) => {
    return (v) => {
      let $dom = fr.cloneNode(true);
      fn?.($dom, v);
      return $dom;
    };
  };
  var mount = (label, component, option) => {
    let app, first, last, destroyList = current_destroyList = [];
    current_mountList = [];
    try {
      app = component(option);
      let $dom = app.$dom;
      delete app.$dom;
      if ($dom.nodeType == 11) {
        first = $dom.firstChild;
        last = $dom.lastChild;
      } else
        first = last = $dom;
      label.appendChild($dom);
      safeGroupCall2(current_mountList, destroyList);
    } finally {
      current_destroyList = current_mountList = null;
    }
    app.destroy = () => {
      safeGroupCall(destroyList);
      removeElements(first, last);
    };
    return app;
  };
  var refer = (active, line) => {
    let result = [], i, v;
    const code = (x, d) => x.charCodeAt() - d;
    for (i = 0; i < line.length; i++) {
      let a = line[i];
      switch (a) {
        case ">":
          active = active.firstChild;
          break;
        case "+":
          active = active.firstChild;
        case ".":
          result.push(active);
          break;
        case "!":
          v = code(line[++i], 48) * 42 + code(line[++i], 48);
          while (v--)
            active = active.nextSibling;
          break;
        case "#":
          active = result[code(line[++i], 48) * 26 + code(line[++i], 48)];
          break;
        default:
          v = code(a, 0);
          if (v >= 97)
            active = result[v - 97];
          else {
            v -= 48;
            while (v--)
              active = active.nextSibling;
          }
      }
    }
    return result;
  };
  function ifBlock(label, fn, parts, parentLabel) {
    let first, last, $cd, destroyList, parentCD = current_cd;
    $onDestroy(() => safeGroupCall2(destroyList, destroyResults));
    function createBlock(builder) {
      let $dom;
      destroyList = current_destroyList = [];
      let mountList = current_mountList = [];
      $cd = current_cd = cd_new(parentCD);
      try {
        $dom = builder();
      } finally {
        current_destroyList = current_mountList = current_cd = null;
      }
      cd_attach(parentCD, $cd);
      if ($dom.nodeType == 11) {
        first = $dom.firstChild;
        last = $dom.lastChild;
      } else
        first = last = $dom;
      if (parentLabel)
        label.appendChild($dom);
      else
        label.parentNode.insertBefore($dom, label);
      safeGroupCall2(mountList, destroyList, 1);
    }
    function destroyBlock() {
      if (!first)
        return;
      destroyResults = [];
      safeGroupCall2(destroyList, destroyResults);
      destroyList.length = 0;
      if ($cd) {
        cd_detach($cd);
        $cd = null;
      }
      if (destroyResults.length) {
        let f = first, l = last;
        Promise.allSettled(destroyResults).then(() => {
          removeElements(f, l);
        });
      } else
        removeElements(first, last);
      first = last = null;
      destroyResults = null;
    }
    $watch(fn, (value) => {
      destroyBlock();
      if (value != null)
        createBlock(parts[value]);
    });
  }

  // ../router.js
  function router() {
    let len = arguments.length - 1;
    let callback = arguments[len];
    let routes = arguments[0];
    let e404 = `404 - PAGE NOT FOUND`;
    let curr;
    if (len === 2)
      e404 = arguments[1];
    addEventListener("popstate", route);
    addEventListener("pushstate", route);
    document.body.addEventListener("click", (ev) => {
      let href = ev.target.getAttribute("href");
      if (!href)
        return;
      ev.preventDefault();
      route(href);
    });
    route();
    function route(x, replace) {
      if (curr == x)
        return;
      if (typeof x === "string")
        history[replace ? "replace" : "pushState"](x, null, x);
      let params = {};
      let match = routes.filter((route2) => {
        let path = route2.path;
        let keys = path.match(/\/:\w+/g);
        let re = new RegExp(path.replace(keys?.join(""), "(.*)"));
        let matched = location.pathname.match(re);
        let isMatch = matched && matched[0] === matched.input;
        if (isMatch) {
          curr = location.pathname;
          let values = matched[1]?.split("/").slice(1);
          if (values && keys) {
            keys = keys?.join("").split("/:").slice(1);
            for (let i = 0; i < values.length; i++) {
              if (i < keys.length)
                params[keys[i]] = values[i];
              else
                params[keys[i]] = values[i];
            }
          }
        }
        return isMatch;
      });
      match = match[match.length - 1];
      if (match) {
        callback(match.page, params);
      } else {
        if (typeof e404 === "string")
          console.log(e404);
        else
          callback(e404, params);
      }
    }
    return {
      route,
      listen() {
        route(location.pathname);
      },
      unlisten() {
        removeEventListener("popstate", route);
        removeEventListener("pushstate", route);
        routes = [];
      }
    };
  }
  var router_default = router;

  // src/pages/about/pages.js
  var pages_exports = {};
  __export(pages_exports, {
    home: () => home_default
  });

  // src/pages/about/+home.xht
  var home_default = ($option = {}) => {
    {
      const $parentElement = htmlToFragment(`<h1 class="mskqcsq">About</h1><h3>About about</h3>`, 1);
      addStyles("mskqcsq", `h1.mskqcsq{color:green}`);
      return { $dom: $parentElement };
    }
  };

  // src/pages/about/pageIndex.xht
  var pageIndex_default = makeComponent(($option) => {
    const $$apply = makeApply();
    let $props = $option.props || {};
    const $context2 = $context;
    autoSubscribe(pages_exports);
    let { params = {} } = $props;
    current_component.$push = ($$props) => ({ params = params } = $props = $$props);
    current_component.$exportedProps = () => ({ params });
    const page = pages_exports[params.page];
    {
      const $parentElement = htmlToFragment(`<><>`, 3);
      let [el1] = refer($parentElement, ">1.");
      ifBlock(
        el1,
        () => page ? 0 : 1,
        [makeBlock(htmlToFragment(` <> `, 2), ($parentElement2) => {
          let [el0] = refer($parentElement2, ">1.");
          attachDynComponent(el0, () => page, ($ComponentConstructor) => callComponent(
            $ComponentConstructor,
            $context2,
            {}
          ));
        }), makeBlock(createTextNode(` `))]
      );
      return $parentElement;
    }
  });

  // src/pages/about/us/pages.js
  var pages_exports2 = {};
  __export(pages_exports2, {
    home: () => home_default2
  });

  // src/pages/about/us/+home.xht
  var home_default2 = ($option = {}) => {
    {
      const $parentElement = htmlToFragment(`<h1>AABOUTT</h1>`, 1);
      return { $dom: $parentElement };
    }
  };

  // src/pages/about/us/pageIndex.xht
  var pageIndex_default2 = makeComponent(($option) => {
    const $$apply = makeApply();
    let $props = $option.props || {};
    const $context2 = $context;
    autoSubscribe(pages_exports2);
    let { params = {} } = $props;
    current_component.$push = ($$props) => ({ params = params } = $props = $$props);
    current_component.$exportedProps = () => ({ params });
    const page = pages_exports2[params.page];
    {
      const $parentElement = htmlToFragment(`<><>`, 3);
      let [el1] = refer($parentElement, ">1.");
      ifBlock(
        el1,
        () => page ? 0 : 1,
        [makeBlock(htmlToFragment(` <> `, 2), ($parentElement2) => {
          let [el0] = refer($parentElement2, ">1.");
          attachDynComponent(el0, () => page, ($ComponentConstructor) => callComponent(
            $ComponentConstructor,
            $context2,
            {}
          ));
        }), makeBlock(createTextNode(` `))]
      );
      return $parentElement;
    }
  });

  // src/pages/baruak/pages.js
  var pages_exports3 = {};
  __export(pages_exports3, {
    bagus: () => bagus_default,
    juga: () => juga_default
  });

  // src/pages/baruak/+bagus.xht
  var bagus_default = ($option = {}) => {
    {
      const $parentElement = htmlToFragment(`<h1>Bagus</h1>`, 1);
      return { $dom: $parentElement };
    }
  };

  // src/pages/baruak/+juga.xht
  var juga_default = ($option = {}) => {
    {
      const $parentElement = htmlToFragment(`<h1>Juga</h1>`, 1);
      return { $dom: $parentElement };
    }
  };

  // src/pages/baruak/pageIndex.xht
  var pageIndex_default3 = makeComponent(($option) => {
    const $$apply = makeApply();
    let $props = $option.props || {};
    const $context2 = $context;
    autoSubscribe(pages_exports3);
    let { params = {} } = $props;
    current_component.$push = ($$props) => ({ params = params } = $props = $$props);
    current_component.$exportedProps = () => ({ params });
    const page = pages_exports3[params.page];
    {
      const $parentElement = htmlToFragment(`<><>`, 3);
      let [el1] = refer($parentElement, ">1.");
      ifBlock(
        el1,
        () => page ? 0 : 1,
        [makeBlock(htmlToFragment(` <> `, 2), ($parentElement2) => {
          let [el0] = refer($parentElement2, ">1.");
          attachDynComponent(el0, () => page, ($ComponentConstructor) => callComponent(
            $ComponentConstructor,
            $context2,
            {}
          ));
        }), makeBlock(createTextNode(` `))]
      );
      return $parentElement;
    }
  });

  // src/pages/Home.xht
  var Home_default = ($option = {}) => {
    {
      const $parentElement = htmlToFragment(`<h1 class="mly95xe">Home</h1><h3>About home</h3>`, 1);
      addStyles("mly95xe", `h1.mly95xe{color:red}`);
      return { $dom: $parentElement };
    }
  };

  // src/routes.js
  var routes_default = [
    { path: "/", page: Home_default },
    { path: "/baruak/:page", page: pageIndex_default3 },
    { path: "/about/:page/:part/:paragraph", page: pageIndex_default },
    { path: "/about/us/:page", page: pageIndex_default2 }
  ];

  // src/cmp/E404.xht
  var E404_default = ($option = {}) => {
    {
      const $parentElement = htmlToFragment(`<center><h1>404</h1><h6>PAGE NOT FOUND</h6></center>`, 1);
      return { $dom: $parentElement };
    }
  };

  // src/App.xht
  var App_default = makeComponent(($option) => {
    const $$apply = makeApply();
    const $context2 = $context;
    autoSubscribe(routes_default);
    let cmp, params;
    let router2 = router_default(routes_default, E404_default, (page, opts) => {
      $$apply();
      cmp = page;
      params = opts;
    }).listen();
    $onDestroy(() => router2.unlisten());
    {
      const $parentElement = htmlToFragment(`<main class="mx9zpuf"><div><h1>Menu</h1><div><a href="/" class="mx9zpuf">Home</a> <a href="/about/home/twelve/4" class="mx9zpuf">About</a> <a href="/about/us/home" class="mx9zpuf">AAbout</a> <a href="/notfound" class="mx9zpuf">Not Found</a></div></div><div></div></main>`, 1);
      let [el1] = refer($parentElement, ">1.");
      ifBlock(
        el1,
        () => cmp ? 0 : null,
        [makeBlock(htmlToFragment(` <> `, 2), ($parentElement2) => {
          let [el0] = refer($parentElement2, ">1.");
          attachDynComponent(el0, () => cmp, ($ComponentConstructor) => callComponentDyn(
            $ComponentConstructor,
            $context2,
            {},
            () => ({ params }),
            compareDeep
          ));
        })],
        true
      );
      addStyles("mx9zpuf", `main.mx9zpuf{display:grid;grid-template-columns:15em 1fr}a.mx9zpuf{display:block}`);
      return $parentElement;
    }
  });

  // src/main.js
  mount(document.body, App_default);
})();
