(function() {
    var MEMORY_KEYS_KEY, MEMORY_MAX_ITEMS, slice = [].slice,
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    MEMORY_MAX_ITEMS = 10;
    MEMORY_KEYS_KEY = "inputmemory_keys";
    window.I = {
        libs: {
            react: $.Deferred(function(_this) {
                return function(d) {
                    if (typeof React !== "undefined" && React !== null) {
                        return d.resolve(React)
                    }
                }
            }(this)),
            selectize: $.Deferred(function(_this) {
                return function(d) {
                    var ref;
                    if (typeof $ !== "undefined" && $ !== null ? (ref = $.fn) != null ? ref.selectize : void 0 : void 0) {
                        return d.resolve($.fn.selectize)
                    }
                }
            }(this)),
            redactor: $.Deferred(function(_this) {
                return function(d) {
                    var ref;
                    if (typeof $ !== "undefined" && $ !== null ? (ref = $.fn) != null ? ref.redactor : void 0 : void 0) {
                        return d.resolve($.fn.redactor)
                    }
                }
            }(this))
        },
        setup_page: function() {
            I.setup_register_referrers($(document.body));
            return _.defer(function(_this) {
                return function() {
                    return I.setup_affiliate_code()
                }
            }(this))
        },
        root_url: function() {
            var host;
            host = null;
            return function(path) {
                if (!host) {
                    host = $("body").data("host") || "";
                    if (host !== "") {
                        host = window.location.protocol + "//" + host;
                        if (window.location.port && window.location.port !== "80") {
                            host += ":" + window.location.port
                        }
                    }
                }
                return host + "/" + path
            }
        }(),
        page_name: function() {
            return $(document.body).data("page_name") || "unknown"
        },
        get_csrf: function() {
            return this._csrf_token || (this._csrf_token = $("meta[name='csrf_token']").attr("value"))
        },
        with_csrf: function(thing) {
            var token;
            if (thing == null) {
                thing = {}
            }
            token = {
                csrf_token: I.get_csrf()
            };
            if ($.type(thing) === "string") {
                return thing + "&" + $.param(token)
            } else {
                return $.extend(thing, token)
            }
        },
        add_params: function(_this) {
            return function(url, p) {
                var rest;
                rest = $.param(p);
                if (url.match(/\?/)) {
                    return url + "&" + rest
                } else {
                    return url + "?" + rest
                }
            }
        }(this),
        flash: function(flash, type) {
            if (type == null) {
                type = "notice"
            }
            this.flasher || (this.flasher = new I.Flasher);
            if (flash.match(/^error:/)) {
                flash = flash.replace(/^error:/, "Error: ");
                type = "error"
            }
            return this.flasher.show(type, flash)
        },
        slugify: function(str, opts) {
            str = str.replace(/\s+/g, "-");
            str = (opts != null ? opts.for_tags : void 0) ? str.replace(/[^\w_.-]/g, "").replace(/^[_.-]+/, "").replace(/[_.-]+$/, "") : str.replace(/[^\w_-]/g, "");
            return str.toLowerCase()
        },
        truncate: function(s, len) {
            if (s.length > len + 3) {
                return _.string.truncate(s, len)
            } else {
                return s
            }
        },
        ecommerce_event: function(event) {
            if (window.ga) {
                ga("ecommerce:addTransaction", event.transaction);
                ga("ecommerce:addItem", event.item);
                return ga("ecommerce:send")
            } else {
                return console.log("ecommerce event:", event)
            }
        },
        event: function(category, action, label, value, interactive) {
            var opts;
            if (interactive == null) {
                interactive = true
            }
            opts = {
                hitType: "event",
                eventCategory: category,
                eventAction: action,
                eventLabel: label,
                eventValue: value
            };
            if (!interactive) {
                opts.nonInteraction = 1
            }
            return I.event_with_opts(opts)
        },
        event_with_opts: function(opts) {
            try {
                if (typeof ga !== "undefined" && ga !== null) {
                    return ga("send", opts)
                } else {
                    console.log("event:", opts);
                    return typeof opts.hitCallback === "function" ? opts.hitCallback() : void 0
                }
            } catch (error) {}
        },
        event2: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : []
        },
        parse_money: function(str) {
            var cents;
            cents = str && parseInt(str.replace(/[^\d]/g, ""), 10);
            return cents || 0
        },
        currency_symbols: {
            USD: "$",
            GBP: "£",
            EUR: "€",
            JPY: "¥"
        },
        currency_formats: {
            USD: {
                prefix: "$"
            },
            GBP: {
                prefix: "£"
            },
            JPY: {
                prefix: "¥"
            },
            EUR: {
                suffix: "€"
            }
        },
        format_money: function(cents, currency) {
            var dollars, symbol;
            if (currency == null) {
                currency = "USD"
            }
            if (cents < 0) {
                return "-" + I.format_money(-cents, currency)
            }
            symbol = I.currency_symbols[currency] || "$";
            if (currency === "JPY") {
                return symbol + cents
            } else {
                dollars = _.str.numberFormat(cents / 100, 2);
                if (currency === "EUR") {
                    return "" + dollars + symbol
                } else {
                    return "" + symbol + dollars
                }
            }
        },
        money_input: function(input, opts) {
            var currency, format;
            if (opts == null) {
                opts = {}
            }
            input = $(input);
            currency = opts.currency || input.data("currency");
            format = I.currency_formats[currency] || {
                prefix: "$"
            };
            return input.maskMoney($.extend({
                affixesStay: true,
                precision: currency === "JPY" ? 0 : 2
            }, format, opts))
        },
        plural: function(noun, count) {
            if (count === 1) {
                return count + " " + noun
            } else {
                return count + " " + noun + "s"
            }
        },
        default_redactor_opts: {
            plugins: ["source", "table", "alignment", "video", "addimage"],
            toolbarFixed: false,
            buttons: ["format", "bold", "italic", "deleted", "lists", "link"],
            minHeight: 250,
            linkSize: 80
        },
        add_recaptcha_if_necessary: function(form, errors) {
            if (errors[0] !== "recaptcha") {
                return
            }
            if (!form.data("adding_recaptcha")) {
                form.data("adding_recaptcha", true);
                I.with_recaptcha(function(_this) {
                    return function() {
                        var el;
                        el = form.find(".g-recaptcha");
                        I.event("recaptcha", "show", I.page_name());
                        return grecaptcha.render(el[0], {
                            sitekey: el.data("sitekey")
                        })
                    }
                }(this))
            }
            form.set_form_errors(["Please fill out the CAPTCHA to continue"]);
            return true
        },
        with_recaptcha: function(_this) {
            return function(fn) {
                var url;
                if (window.grecaptcha) {
                    return fn(_this)
                } else if (_this.recaptcha_deferred) {
                    return _this.recaptcha_deferred.done(fn)
                } else {
                    _this.recaptcha_deferred = $.Deferred().done(fn);
                    window._chang_recaptcha_loaded = function() {
                        return this.recaptcha_deferred.resolve()
                    };
                    url = "https://www.google.com/recaptcha/api.js?onload=_chang_recaptcha_loaded&render=explicit";
                    return $('<script type="text/javascript">').attr("src", url).appendTo("head")
                }
            }
        }(this),
        wait_for_object: function(_this) {
            return function(obj, name, fn) {
                var add, t, tick;
                t = 1;
                add = 10;
                tick = function() {
                    if (obj[name]) {
                        return typeof fn === "function" ? fn() : void 0
                    }
                    t += add;
                    t = Math.min(500, t);
                    return setTimeout(tick, t)
                };
                return tick()
            }
        }(this),
        with_redactor: function(_this) {
            return function(fn) {
                return I.wait_for_object($.fn, "redactor", fn)
            }
        }(this),
        with_selectize: function(_this) {
            return function(fn) {
                return I.libs.selectize.done(fn)
            }
        }(this),
        redactor: function(_this) {
            return function(el, opts) {
                var e, p;
                if (opts == null) {
                    opts = {}
                }
                if (window.location.href.match(/\bredactor=0\b/)) {
                    return
                }
                if (!$.fn.redactor) {
                    console.warn("tried to create redactor text element without redactor on page", el[0]);
                    return
                }
                opts = $.extend({}, I.default_redactor_opts, opts);
                if (opts.source === false) {
                    delete opts.source;
                    opts.plugins = function() {
                        var j, len1, ref, results;
                        ref = opts.plugins;
                        results = [];
                        for (j = 0, len1 = ref.length; j < len1; j++) {
                            p = ref[j];
                            if (p !== "source") {
                                results.push(p)
                            }
                        }
                        return results
                    }()
                }
                try {
                    return el.redactor(opts)
                } catch (error) {
                    e = error;
                    I.event("error", "redactor", "invalid_content");
                    return el.parent().replaceWith(el).end().val("").redactor(opts)
                }
            }
        }(this),
        get_template: function(name) {
            return _.template($("#" + name + "_tpl").html())
        },
        lazy_template: function(obj, name) {
            return function() {
                var args, fn;
                args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                fn = I.get_template(name);
                obj.prototype.template = fn;
                return fn.apply(null, args)
            }
        },
        setup_sticky_bar: function(trigger) {
            var body, visible, win;
            win = $(window);
            body = $(document.body);
            trigger = $(trigger);
            visible = false;
            return win.on("scroll", function(_this) {
                return function(e) {
                    if (win.scrollTop() > trigger.offset().top + trigger.outerHeight()) {
                        if (!visible) {
                            body.addClass("show_sticky_bar");
                            return visible = true
                        }
                    } else {
                        if (visible) {
                            body.removeClass("show_sticky_bar");
                            return visible = false
                        }
                    }
                }
            }(this))
        },
        setup_selectize: function(el) {
            return el.find(".selectize_input").each(function(i, input) {
                var $input, REGEX_EMAIL, descriptions, optgroups, options, params, placeholder, render;
                $input = $(input);
                if ($input.hasClass("selectized")) {
                    return
                }
                params = {
                    plugins: [],
                    persist: false
                };
                if ($input.is("select")) {
                    descriptions = {};
                    $input.find("option").each(function(i, option) {
                        var $option;
                        $option = $(option);
                        return descriptions[$option.val()] = $option.data("extra")
                    });
                    render = function(data, escape) {
                        var content, desc;
                        content = escape(data.text);
                        if (desc = descriptions[data.value]) {
                            content = content + " <span class='sub'>— " + desc + "</span>"
                        }
                        return "<div>" + content + "</div>"
                    };
                    params.render = {
                        item: render,
                        option: render
                    }
                }
                if (placeholder = $input.data("placeholder")) {
                    params.placeholder = placeholder
                }
                if ($input.hasClass("dropdown")) {
                    params.maxItems = 1
                }
                if ($input.hasClass("email_selector")) {
                    REGEX_EMAIL = "([a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + "(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)";
                    params.valueField = "email";
                    params.labelField = "name";
                    params.searchField = ["name", "email"];
                    params.render = {
                        item: function(item, escape) {
                            return "<div>" + (item.name ? '<span class="name">' + escape(item.name) + "</span>" : "") + (item.email ? '<span class="email">' + escape(item.email) + "</span>" : "") + "</div>"
                        },
                        option: function(item, escape) {
                            var caption, label;
                            label = item.name || item.email;
                            caption = item.name ? item.email : null;
                            return "<div>" + '<span class="label">' + escape(label) + "</span>" + (caption ? '<span class="caption">' + escape(caption) + "</span>" : "") + "</div>"
                        }
                    };
                    params.createFilter = function(input) {
                        var match, regex;
                        regex = new RegExp("^" + REGEX_EMAIL + "$", "i");
                        match = input.match(regex);
                        if (match) {
                            return !this.options.hasOwnProperty(match[0])
                        }
                        regex = new RegExp("^([^<]*)<" + REGEX_EMAIL + ">$", "i");
                        match = input.match(regex);
                        if (match) {
                            return !this.options.hasOwnProperty(match[2])
                        }
                        return false
                    };
                    params.create = function(input) {
                        var match;
                        if (new RegExp("^" + REGEX_EMAIL + "$", "i").test(input)) {
                            return {
                                email: input
                            }
                        }
                        match = input.match(new RegExp("^([^<]*)<" + REGEX_EMAIL + ">$", "i"));
                        if (match) {
                            return {
                                email: match[2],
                                name: $.trim(match[1])
                            }
                        }
                        alert("Invalid email address.");
                        return false
                    }
                }
                if (options = $input.data("options")) {
                    if ($input.hasClass("email_selector")) {
                        params.options = options
                    } else if ($input.hasClass("options_object")) {
                        params.options = options;
                        params.searchField = ["text", "keywords"]
                    } else {
                        params.options = options.map(function(opt) {
                            return {
                                value: opt[0],
                                text: opt[1]
                            }
                        })
                    }
                    params.plugins.push("remove_button");
                    params.delimiter = ",";
                    params.persist = false
                }
                if (optgroups = $input.data("optgroups")) {
                    params.optgroups = optgroups
                }
                return $input.selectize(params)
            })
        },
        format_dates: function(outer, method) {
            var el, j, len1, ref, results;
            if (method == null) {
                method = "calendar"
            }
            moment.lang("en", {
                calendar: {
                    lastDay: "[Yesterday at] LT",
                    sameDay: "[Today at] LT",
                    nextDay: "[Tomorrow at] LT",
                    lastWeek: "[last] dddd [at] LT",
                    nextWeek: "dddd [at] LT",
                    sameElse: "MMMM Do YYYY [at] LT"
                }
            });
            ref = outer.find(".date_format");
            results = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
                el = ref[j];
                results.push(function(el) {
                    var full_date, method_args, real_method, ref1;
                    real_method = el.data("format_method") || method;
                    method_args = el.data("format_args") || [];
                    if (!_.isArray(method_args)) {
                        method_args = [method_args]
                    }
                    full_date = el.html();
                    return el.html((ref1 = moment.utc(full_date).local())[real_method].apply(ref1, method_args)).attr("title", full_date + " UTC")
                }($(el)))
            }
            return results
        },
        specific_humanize: function(duration, num_parts, truncate_seconds) {
            var fn, j, key, len1, out, pair, pairs, single, val;
            if (num_parts == null) {
                num_parts = null
            }
            if (truncate_seconds == null) {
                truncate_seconds = true
            }
            pairs = [
                ["y", "years", "a year"],
                ["m", "months", "a month"],
                ["d", "days", "a day"],
                ["h", "hours", "an hour"],
                ["m", "minutes", "a minute"],
                ["s", "seconds", "a second"]
            ];
            out = [];
            for (j = 0, len1 = pairs.length; j < len1; j++) {
                pair = pairs[j];
                if (num_parts && out.length === num_parts) {
                    break
                }
                key = pair[0], fn = pair[1], single = pair[2];
                val = duration[fn]();
                if (val > 0) {
                    if (val > 1) {
                        if (fn === "seconds" && truncate_seconds) {
                            out.push("a few seconds")
                        } else {
                            out.push(val + " " + fn)
                        }
                    } else {
                        out.push(single)
                    }
                }
            }
            if (out.length > 1) {
                out[out.length - 1] = "and " + out[out.length - 1]
            }
            return out.join(", ")
        },
        format_filesize: function(outer, selector) {
            var file_size, j, len1, ref, results;
            if (selector == null) {
                selector = ".file_size_value"
            }
            ref = outer.find(selector);
            results = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
                file_size = ref[j];
                file_size = $(file_size);
                results.push(file_size.html(_.str.formatBytes(parseInt(file_size.html()))))
            }
            return results
        },
        adjust_font_size_to_fit: function(_this) {
            return function(el, min_size) {
                var _el, font_size, results;
                if (min_size == null) {
                    min_size = 16
                }
                if (!el.length) {
                    return
                }
                font_size = el.css("font-size");
                font_size = parseInt(font_size.match(/\d+/), 10);
                _el = el[0];
                results = [];
                while (_el.offsetWidth < _el.scrollWidth) {
                    font_size -= 2;
                    if (font_size < min_size) {
                        break
                    }
                    results.push(el.css("font-size", font_size + "px"))
                }
                return results
            }
        }(this),
        date_format: "yy-mm-dd",
        time_format: "HH:mm:ss",
        to_local_time: function(t) {
            return moment.utc(t, "YYYY-MM-DD HH:mm:ss").local().toDate()
        },
        format_date_time: function(d) {
            var date, time;
            time = $.datepicker.formatTime(this.time_format, {
                hour: d.getHours(),
                minute: d.getMinutes(),
                second: d.getSeconds()
            });
            date = $.datepicker.formatDate(this.date_format, new Date(d));
            return date + " " + time
        },
        format_date: function(d) {
            return $.datepicker.formatDate(this.date_format, new Date(d))
        },
        datetimepicker: function(pickers, opts) {
            var j, len1, p, picker, val;
            for (j = 0, len1 = pickers.length; j < len1; j++) {
                p = pickers[j];
                picker = $(p);
                if (val = picker.attr("value")) {
                    picker.val(this.format_date_time(this.to_local_time(val)))
                }
            }
            return pickers.datetimepicker($.extend({
                timeFormat: this.time_format,
                dateFormat: this.date_format,
                beforeShow: function(_this) {
                    return function() {
                        _.defer(function() {
                            return $("#ui-datepicker-div").css("z-index", 100)
                        });
                        return void 0
                    }
                }(this)
            }, opts))
        },
        datepicker: function(pickers, opts) {
            return pickers.datepicker($.extend({
                dateFormat: this.date_format,
                beforeShow: function(_this) {
                    return function() {
                        _.defer(function() {
                            return $("#ui-datepicker-div").css("z-index", 100)
                        });
                        return void 0
                    }
                }(this)
            }, opts))
        },
        slug_input: function(_this) {
            return function(input, bound_input) {
                var valid_slug_chars;
                valid_slug_chars = /[a-z_0-9_-]/g;
                input.on("keypress", function(e) {
                    var char;
                    if (e.keyCode >= 32) {
                        char = String.fromCharCode(e.keyCode);
                        if (!char.match(valid_slug_chars)) {
                            return false
                        }
                    }
                });
                if (bound_input && bound_input.length) {
                    input.on("change", function(e) {
                        var slug;
                        slug = I.slugify(bound_input.val());
                        if (input.val().match(/^\s*$/) && slug !== "") {
                            return input.val(slug)
                        }
                    });
                    return bound_input.on("change", function(e) {
                        if (input.val().match(/^\s*$/)) {
                            return input.val(I.slugify($(e.currentTarget).val()))
                        }
                    })
                }
            }
        }(this),
        deferred_links: function(el, selector, promise_fn) {
            promise_fn || (promise_fn = I.delegate_tracking);
            el.on("mouseup", selector, function(e) {
                var target;
                if (e.which !== 2) {
                    return
                }
                target = $(e.currentTarget);
                return promise_fn(target, e)
            });
            return el.on("click", selector, function(e) {
                var finished, is_blank, ref, target;
                if (e.which !== 1) {
                    return
                }
                target = $(e.currentTarget);
                is_blank = e.metaKey || e.ctrlKey || e.shiftKey || target.attr("target") === "_blank";
                finished = null;
                if (!is_blank) {
                    finished = function(_this) {
                        return function() {
                            if (!finished) {
                                return
                            }
                            finished = null;
                            return window.location = target.attr("href")
                        }
                    }(this);
                    setTimeout(function(_this) {
                        return function() {
                            return typeof finished === "function" ? finished() : void 0
                        }
                    }(this), 200)
                }
                if ((ref = promise_fn(target, e)) != null) {
                    ref.done(finished)
                }
                if (!is_blank) {
                    return false
                }
            })
        },
        delegate_tracking: function(_this) {
            return function(el) {
                var promises;
                promises = [];
                el.trigger("i:delegate_tracking", [function(p) {
                    return promises.push(p)
                }]);
                return $.when.apply($, promises)
            }
        }(this),
        ga_tracker: function(_this) {
            return function(category, action, label, value) {
                var send_event;
                return send_event = function(target) {
                    var opts, ref, ref1, ref2, ref3;
                    opts = {
                        hitType: "event",
                        eventCategory: (ref = target.data("category")) != null ? ref : category,
                        eventAction: (ref1 = target.data("action")) != null ? ref1 : action,
                        eventLabel: (ref2 = target.data("label")) != null ? ref2 : label,
                        eventValue: (ref3 = target.data("value")) != null ? ref3 : value
                    };
                    return $.Deferred(function(_this) {
                        return function(d) {
                            opts.hitCallback = function() {
                                return d.resolve()
                            };
                            return I.event_with_opts(opts)
                        }
                    }(this))
                }
            }
        }(this),
        tracked_links: function() {
            var action, category, el, label, rest, tracker, value;
            el = arguments[0], rest = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            category = rest[0], action = rest[1], label = rest[2], value = rest[3];
            tracker = I.ga_tracker(category, action, label, value);
            I.deferred_links(el, "a[data-label]", tracker);
            return el.on("i:track_link", function(e, l) {
                var _label;
                if (l) {
                    _label = l[0]
                }
                return I.ga_tracker(category, action, _label != null ? _label : label, value)($(e.target))
            })
        },
        set_cookie: function(name, value, opts) {
            if (opts == null) {
                opts = {}
            }
            if (I.in_dev) {
                console.log("set cookie:", [name, value], opts)
            }
            return Cookies.set(name, value, $.extend({
                path: "/",
                domain: "." + $(document.body).data("host")
            }, opts))
        },
        set_register_referrer: function(_this) {
            return function(action) {
                var page;
                page = I.page_name();
                if (page != null) {
                    I.set_cookie("ref:register:page_params", page)
                }
                if (action != null) {
                    return I.set_cookie("ref:register:action", action)
                }
            }
        }(this),
        setup_register_referrers: function(_this) {
            return function(el) {
                if (I.current_user) {
                    return
                }
                return el.on("mouseup", "[data-register_action]", function(e) {
                    var action;
                    action = $(e.currentTarget).data("register_action");
                    return I.set_register_referrer(action)
                })
            }
        }(this),
        setup_affiliate_code: function(_this) {
            return function(code, replace) {
                var location, ref;
                if (replace == null) {
                    replace = false
                }
                if (code == null) {
                    code = (ref = window.location.search.match(/\bac=([\w\d]+)/)) != null ? ref[1] : void 0
                }
                if (!code) {
                    return
                }
                if (!replace && code === Cookies.get("acode")) {
                    return
                }
                I.set_cookie("acode", code, {
                    expires: 1
                });
                if (document.referrer) {
                    I.set_cookie("acode:ref", document.referrer.substring(0, 180), {
                        expires: 1
                    })
                }
                location = window.location.href.replace(/\?.*$/, "").substring(0, 180);
                return I.set_cookie("acode:land", location, {
                    expires: 1
                })
            }
        }(this),
        setup_grid_referrers: function(_this) {
            return function(el, value_fn) {
                var set_cookie_for;
                set_cookie_for = function(el) {
                    var game_id, sale, sale_id, sale_type;
                    if (!el.closest(".game_author").length) {
                        if (game_id = el.closest("[data-game_id]").data("game_id")) {
                            I.ReferrerTracker.push("game", game_id, value_fn(el))
                        }
                    }
                    if (!el.closest(".sale_author").length) {
                        sale = el.closest("[data-sale_id]");
                        if (sale_id = sale.data("sale_id")) {
                            sale_type = sale.data("sale_type");
                            return I.ReferrerTracker.push(sale_type, sale_id, value_fn(el))
                        }
                    }
                };
                el.on("mouseup", ".game_cell a, .sale_row a, .leader_game a", function(e) {
                    if (e.which > 3) {
                        return
                    }
                    return set_cookie_for($(e.currentTarget))
                });
                return el.on("i:track_link", function(e) {
                    return set_cookie_for($(e.target))
                })
            }
        }(this),
        bind_checkbox_to_input: function(_this) {
            return function(checkbox, input, callback) {
                var update_state;
                update_state = function() {
                    var checked;
                    checked = checkbox.prop("checked");
                    input.prop("disabled", checked);
                    return typeof callback === "function" ? callback(checked) : void 0
                };
                checkbox.on("change", update_state);
                return update_state()
            }
        }(this),
        add_facebook: function(_this) {
            return function(callback) {
                var fjs, id, js;
                if (window.FB) {
                    return
                }
                _this.add_facebook = function() {};
                $('<div id="fb-root"></div>').appendTo(document.body);
                id = "facebook-jssdk";
                if (document.getElementById(id)) {
                    return
                }
                if (callback != null) {
                    window.fbAsyncInit = callback
                }
                fjs = document.getElementsByTagName("script")[0];
                js = document.createElement("script");
                js.id = id;
                js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&appId=537395183072744&version=v2.0";
                return fjs.parentNode.insertBefore(js, fjs)
            }
        }(this),
        add_twitter: function(_this) {
            return function() {
                var fjs, id, js;
                id = "twitter-wjs";
                if (document.getElementById(id)) {
                    return
                }
                _this.add_twitter = function() {};
                fjs = document.getElementsByTagName("script")[0];
                js = document.createElement("script");
                js.id = "twitter-wjs";
                js.src = "//platform.twitter.com/widgets.js";
                return fjs.parentNode.insertBefore(js, fjs)
            }
        }(this),
        add_react: function() {
            var loading_react, placeholder;
            loading_react = $.Deferred();
            I.add_react = function() {
                return loading_react
            };
            I.libs.react.done(function(_this) {
                return function() {
                    return loading_react.resolve()
                }
            }(this));
            placeholder = $("#lib_react_src");
            placeholder.replaceWith($('<script type="text/javascript">').attr("src", placeholder.data("src")));
            return loading_react
        },
        has_follow_button: function(_this) {
            return function(el, opts) {
                var animate_follow, animate_unfollow, cls, params, ref, ref1, ref2;
                if (opts == null) {
                    opts = {}
                }
                el = $(el);
                cls = (ref = opts.cls) != null ? ref : "follow_button_widget";
                animate_follow = (ref1 = opts.animate_follow) != null ? ref1 : "animate_bounce";
                animate_unfollow = (ref2 = opts.animate_unfollow) != null ? ref2 : "animate_drop_down";
                params = {};
                params[cls] = function(btn) {
                    var data, following, timeout, url;
                    if (!I.current_user) {
                        return "continue"
                    }
                    if (btn.is(".loading")) {
                        return
                    }
                    btn.removeClass(animate_follow + " " + animate_unfollow);
                    timeout = $.Deferred(function(d) {
                        return setTimeout(function() {
                            return d.resolve()
                        }, 500)
                    });
                    following = btn.is(".is_following");
                    url = following ? (_.defer(function() {
                        return btn.addClass(animate_unfollow)
                    }), btn.data("unfollow_url")) : (_.defer(function() {
                        return btn.addClass(animate_follow)
                    }), btn.data("follow_url"));
                    btn.addClass("loading").trigger("i:track_link", ["follow_btn"]);
                    data = btn.data("follow_data") || {};
                    return $.when($.post(url, I.with_csrf(data)), timeout).done(function(arg) {
                        var res;
                        res = arg[0];
                        btn.removeClass("loading " + animate_follow + " " + animate_unfollow);
                        if (res.errors) {
                            I.flash(res.errors.join(", "));
                            return
                        }
                        return btn.toggleClass("is_following", res.following).trigger("i:follow_updated", [{
                            user_id: btn.data("user_id"),
                            following: res.following,
                            btn: btn
                        }])
                    })
                };
                el.dispatch("click", params);
                return $(document.body).on("i:follow_updated", function(e, arg) {
                    var btn, following, user_id;
                    user_id = arg.user_id, following = arg.following, btn = arg.btn;
                    return el.find("." + cls + "[data-user_id=" + user_id + "]").not(btn).toggleClass("is_following", following)
                })
            }
        }(this),
        is_mobile: function(_this) {
            return function() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            }
        }(this),
        is_ios: function(_this) {
            return function() {
                return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
            }
        }(this),
        strip_css: function(_this) {
            return function(str) {
                return str.replace(/<\s*\/\s*style\s*>/i, "")
            }
        }(this),
        request_fullscreen: function(_this) {
            return function(el, orientation) {
                var entered, ref, ref1;
                entered = el.requestFullscreen ? (el.requestFullscreen(), true) : el.msRequestFullscreen ? (el.msRequestFullscreen(), true) : el.mozRequestFullScreen ? (el.mozRequestFullScreen(), true) : el.webkitRequestFullscreen ? (el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT), true) : false;
                if (entered && orientation) {
                    if ((ref = window.screen) != null) {
                        if ((ref1 = ref.orientation) != null) {
                            if (typeof ref1.lock === "function") {
                                ref1.lock(orientation)
                            }
                        }
                    }
                }
                return entered
            }
        }(this),
        is_fullscreen: function(_this) {
            return function() {
                return !(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement)
            }
        }(this),
        exit_fullscreen: function(_this) {
            return function() {
                if (document.exitFullscreen) {
                    return document.exitFullscreen()
                } else if (document.msExitFullscreen) {
                    return document.msExitFullscreen()
                } else if (document.mozCancelFullScreen) {
                    return document.mozCancelFullScreen()
                } else if (document.webkitExitFullscreen) {
                    return document.webkitExitFullscreen()
                }
            }
        }(this),
        toggle_fullscreen: function(_this) {
            return function(el, orientation) {
                if (I.is_fullscreen()) {
                    I.exit_fullscreen();
                    return false
                } else {
                    if (!I.request_fullscreen(el, orientation)) {
                        return "failed"
                    }
                    return true
                }
            }
        }(this),
        setup_dirty_warning: function(_this) {
            return function(form, cb) {
                cb || (cb = function() {
                    return form.data("dirty")
                });
                form.data("dirty", false);
                $(window).on("beforeunload", function() {
                    var msg;
                    msg = cb();
                    if (!msg) {
                        return
                    }
                    switch (typeof msg) {
                        case "string":
                            return msg;
                        default:
                            return "You've made modifications to this page."
                    }
                });
                form.on("i:after_submit", function() {
                    return form.data("dirty", false)
                });
                return _.defer(function() {
                    form.on("change", "input, select, textarea", function(e) {
                        return form.data("dirty", true)
                    });
                    return form.on("keydown, mousedown", ".redactor-editor", function() {
                        return form.data("dirty", true)
                    })
                })
            }
        }(this),
        remote_submit: function(_this) {
            return function(form, more_data) {
                var buttons, data;
                form.trigger("i:before_submit");
                data = form.serializeArray();
                buttons = form.addClass("loading").find("button, input[type='submit'], input[type='checkbox']").prop("disabled", true).addClass("disabled");
                return $.when(more_data).then(function(d) {
                    var ref;
                    if (d) {
                        data = data.concat(d)
                    }
                    return $.ajax({
                        data: data,
                        type: (ref = form.attr("method")) != null ? ref : "POST",
                        dataType: "json",
                        url: form.attr("action"),
                        xhrFields: {
                            withCredentials: true
                        },
                        error: function(xhr) {
                            var res;
                            res = function() {
                                try {
                                    return JSON.parse(xhr.responseText)
                                } catch (error) {}
                            }();
                            if (res != null ? res.errors : void 0) {
                                return I.flash(res.errors.join(", "))
                            } else {
                                return I.flash("We seem to be having server problems right now! Please try again later.")
                            }
                        },
                        complete: function() {
                            buttons.prop("disabled", false).removeClass("disabled");
                            form.removeClass("loading");
                            return form.trigger("i:after_submit")
                        }
                    }).then(null, function(xhr) {
                        try {
                            return JSON.parse(xhr.responseText)
                        } catch (error) {}
                    })
                })
            }
        }(this),
        is_middle_click: function(_this) {
            return function(e) {
                return 2 === e.which || e.metaKey || e.ctrlKey
            }
        }(this),
        escape_regex: function(_this) {
            return function(str) {
                return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
            }
        }(this),
        move: function(array, item, dir) {
            var copy, idx, o, target_idx;
            idx = array.indexOf(item);
            if (idx === -1) {
                throw "Failed to find object in array"
            }
            target_idx = idx + dir;
            if (target_idx < 0 || target_idx >= array.length) {
                throw "Movement is outside of array (" + target_idx + ") [0, " + (array.length - 1) + "]"
            }
            copy = function() {
                var j, len1, results;
                results = [];
                for (j = 0, len1 = array.length; j < len1; j++) {
                    o = array[j];
                    if (o !== item) {
                        results.push(o)
                    }
                }
                return results
            }();
            copy.splice(target_idx, 0, item);
            return copy
        },
        format_integer: function(num) {
            if (num > 1e7) {
                return Math.floor(num / 1e6) + "m"
            } else if (num >= 1e6) {
                return Math.floor(num / 1e5) / 10 + "m"
            } else if (num > 1e4) {
                return Math.floor(num / 1e3) + "k"
            } else if (num >= 1e3) {
                return Math.floor(num / 100) / 10 + "k"
            } else {
                return "" + num
            }
        },
        store_memory: function(key, value) {
            var k, remaining_keys, stored_keys, to_remove;
            if (!window.localStorage) {
                return
            }
            stored_keys = function() {
                try {
                    return JSON.parse(localStorage.getItem(MEMORY_KEYS_KEY))
                } catch (error) {}
            }();
            stored_keys || (stored_keys = []);
            if (stored_keys[0] !== key) {
                remaining_keys = function() {
                    var j, len1, results;
                    results = [];
                    for (j = 0, len1 = stored_keys.length; j < len1; j++) {
                        k = stored_keys[j];
                        if (key !== k) {
                            results.push(k)
                        }
                    }
                    return results
                }();
                stored_keys = [key].concat(remaining_keys);
                while (stored_keys.length > MEMORY_MAX_ITEMS) {
                    to_remove = stored_keys.pop();
                    if (typeof localStorage !== "undefined" && localStorage !== null) {
                        localStorage.removeItem(to_remove)
                    }
                }
                localStorage.setItem(MEMORY_KEYS_KEY, JSON.stringify(stored_keys))
            }
            return localStorage.setItem(key, value)
        },
        clear_memory: function(key) {
            var k, stored_keys;
            if (!window.localStorage) {
                return
            }
            stored_keys = function() {
                try {
                    return JSON.parse(localStorage.getItem(MEMORY_KEYS_KEY))
                } catch (error) {}
            }();
            if (stored_keys) {
                localStorage.setItem(MEMORY_KEYS_KEY, JSON.stringify(function() {
                    var j, len1, results;
                    results = [];
                    for (j = 0, len1 = stored_keys.length; j < len1; j++) {
                        k = stored_keys[j];
                        if (key !== k) {
                            results.push(k)
                        }
                    }
                    return results
                }()))
            }
            try {
                return localStorage.removeItem(key)
            } catch (error) {}
        }
    };
    $(function() {
        var match;
        if (match = window.location.hash.match(/\bflash=([^&]*)/)) {
            I.flash(match[1]);
            window.location.hash = window.location.hash.replace(/\bflash=([^&]*)/, "")
        }
        if (I.ie) {
            return $(document.body).addClass("ie")
        }
    });
    I.Flasher = function() {
        Flasher.prototype.duration = 1e4;
        Flasher.prototype.animation_duration = 250;
        Flasher.prototype.clipping = "-7px";

        function Flasher() {
            $(document).on("click", ".global_flash", function(_this) {
                return function() {
                    return _this.dismiss()
                }
            }(this))
        }
        Flasher.prototype.dismiss = function() {
            var elm;
            if (elm = this.current_flash) {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null
                }
                elm.css({
                    "margin-top": "-" + (elm.outerHeight() + 4) + "px"
                });
                return setTimeout(function(_this) {
                    return function() {
                        return elm.remove()
                    }
                }(this), this.animation_duration * 2)
            }
        };
        Flasher.prototype.show = function(type, msg) {
            var elm;
            this.dismiss();
            elm = $("<div class='global_flash " + type + "' role='alert' aria-live='polite'>").text(msg).appendTo("body");
            elm.css({
                "margin-left": "-" + elm.width() / 2 + "px",
                "margin-top": "-" + (elm.outerHeight() + 4) + "px"
            });
            this.timeout = setTimeout(function(_this) {
                return function() {
                    elm.addClass("animated");
                    elm.css({
                        "margin-top": _this.clipping
                    });
                    return setTimeout(function() {
                        return _this.dismiss()
                    }, _this.duration)
                }
            }(this), 100);
            return this.current_flash = elm
        };
        return Flasher
    }();
    I.InfiniteScroll = function() {
        InfiniteScroll.prototype.loading_element = ".grid_loader";

        function InfiniteScroll(el) {
            this.el = $(el);
            this.setup_loading()
        }
        InfiniteScroll.prototype.get_next_page = function() {
            return alert("override me")
        };
        InfiniteScroll.prototype.setup_loading = function() {
            var check_scroll_pos, win;
            this.loading_row = this.el.find(this.loading_element);
            if (!this.loading_row.length) {
                return
            }
            win = $(window);
            check_scroll_pos = function(_this) {
                return function() {
                    if (_this.el.is(".loading")) {
                        return
                    }
                    if (win.scrollTop() + win.height() >= _this.loading_row.offset().top) {
                        return _this.get_next_page()
                    }
                }
            }(this);
            win.on("scroll.browse_loader", check_scroll_pos);
            return check_scroll_pos()
        };
        InfiniteScroll.prototype.remove_loader = function() {
            $(window).off("scroll.browse_loader");
            return this.loading_row.remove()
        };
        return InfiniteScroll
    }();
    I.InfiniteGameGrid = function(superClass) {
        extend(InfiniteGameGrid, superClass);

        function InfiniteGameGrid() {
            return InfiniteGameGrid.__super__.constructor.apply(this, arguments)
        }
        InfiniteGameGrid.prototype.method = "post";
        InfiniteGameGrid.prototype.current_page = 1;
        InfiniteGameGrid.prototype.get_next_page = function() {
            this.current_page += 1;
            this.el.addClass("loading");
            return $[this.method]("", {
                page: this.current_page,
                format: "json"
            }, function(_this) {
                return function(res) {
                    _this.el.removeClass("loading");
                    if (res.num_items > 0) {
                        return _this.grid.add_image_loading($(res.content).appendTo(_this.grid.el).hide().fadeIn())
                    } else {
                        return _this.remove_loader()
                    }
                }
            }(this))
        };
        return InfiniteGameGrid
    }(I.InfiniteScroll);
    _.templateSettings = {
        escape: /\{\{(?![&])(.+?)\}\}/g,
        interpolate: /\{\{&(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };
    _.str.formatBytes = function() {
        var thresholds;
        thresholds = [
            ["gb", Math.pow(1024, 3)],
            ["mb", Math.pow(1024, 2)],
            ["kb", 1024]
        ];
        return function(bytes) {
            var j, label, len1, min, ref;
            for (j = 0, len1 = thresholds.length; j < len1; j++) {
                ref = thresholds[j], label = ref[0], min = ref[1];
                if (bytes >= min) {
                    return "" + _.str.numberFormat(bytes / min) + label
                }
            }
            return _.str.numberFormat(bytes) + " bytes"
        }
    }();
    $.easing.smoothstep = function(t) {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }
}).call(this);
(function() {
    var show_images;
    $.fn.dispatch = function(event_type, table) {
        this.on(event_type, function(_this) {
            return function(e) {
                var elm, fn, key, res;
                for (key in table) {
                    fn = table[key];
                    elm = $(e.target).closest("." + key);
                    if (!elm.length) {
                        continue
                    }
                    if (elm.is(".disabled")) {
                        return false
                    }
                    res = fn(elm, e);
                    if (res === "continue") {
                        return
                    }
                    return false
                }
                return null
            }
        }(this));
        return this
    };
    $.fn.exists = function() {
        if (this.length > 0) {
            return this
        } else {
            return false
        }
    };
    $.fn.has_tooltips = function(opts) {
        var hide, refresh, show, show_tooltip, tooltip_drop, tooltip_template;
        if (opts == null) {
            opts = {}
        }
        if (I.is_mobile()) {
            return
        }
        tooltip_drop = function() {
            var drop;
            drop = $('<div class="tooltip_drop"></div>');
            $(document.body).append(drop);
            tooltip_drop = function() {
                return drop
            };
            return drop
        };
        tooltip_template = _.template('<div class="tooltip">{{ label }}</div>');
        show_tooltip = function(tooltip_target, instant) {
            var el, height, offset, width;
            if (instant == null) {
                instant = false
            }
            el = tooltip_target.data("tooltip_el");
            if (!el) {
                el = $(tooltip_template({
                    label: tooltip_target.attr("aria-label") || tooltip_target.data("tooltip")
                }));
                tooltip_target.data("tooltip_el", el)
            }
            el.removeClass("visible");
            tooltip_drop().empty().append(el);
            offset = tooltip_target.offset();
            height = el.outerHeight();
            width = el.outerWidth();
            el.css({
                position: "absolute",
                top: opts.below ? offset.top + tooltip_target.outerHeight() + 10 : offset.top - height - 10,
                left: Math.floor(offset.left + (tooltip_target.outerWidth() - width) / 2)
            });
            el.toggleClass("below", !!opts.below);
            if (instant) {
                return el.addClass("visible")
            } else {
                return setTimeout(function(_this) {
                    return function() {
                        return el.addClass("visible")
                    }
                }(this), 10)
            }
        };
        refresh = function(_this) {
            return function(e) {
                var el, tooltip_target;
                tooltip_target = $(e.currentTarget);
                el = tooltip_target.data("tooltip_el");
                tooltip_target.removeData("tooltip_el");
                if (!el) {
                    return
                }
                if (el.is(":visible")) {
                    return show_tooltip(tooltip_target, true)
                }
            }
        }(this);
        show = function(_this) {
            return function(e) {
                var tooltip_target;
                tooltip_target = $(e.currentTarget);
                if (tooltip_target.closest(".redactor-box").length) {
                    return
                }
                return show_tooltip(tooltip_target)
            }
        }(this);
        hide = function(_this) {
            return function(e) {
                var el, tooltip_target;
                tooltip_target = $(e.currentTarget);
                if (el = tooltip_target.data("tooltip_el")) {
                    return el.remove()
                }
            }
        }(this);
        if (this.is("[data-tooltip]")) {
            this.on("i:refresh_tooltip", refresh);
            this.on("mouseenter focus", show);
            this.on("mouseleave blur i:hide_tooltip", hide)
        } else {
            this.on("i:refresh_tooltip", "[data-tooltip], [aria-label]", refresh);
            this.on("i:clear_tooltips", function() {
                return tooltip_drop().empty()
            });
            this.on("mouseenter focus", "[data-tooltip], [aria-label]", show);
            this.on("mouseleave blur i:hide_tooltip", "[data-tooltip], [aria-label]", hide)
        }
        return this
    };
    $.fn.inline_edit = function(opts) {
        var finished, input, save;
        if (opts == null) {
            opts = {}
        }
        if (this.is(".inline_editing")) {
            this.data("finished_editing")();
            return
        }
        this.addClass("inline_editing");
        input = $('<input type="text" class="inline_edit_input" />').attr("placeholder", this.data("placeholder")).val((typeof opts.get_val === "function" ? opts.get_val(this) : void 0) || this.text()).insertAfter(this.hide()).select();
        finished = function(_this) {
            return function() {
                input.remove();
                _this.show();
                $(document).off("click.inline_editing");
                return _this.removeClass("inline_editing")
            }
        }(this);
        this.data("finished_editing", finished);
        save = function(_this) {
            return function() {
                input.prop("disabled", true);
                if (opts.set_val) {
                    return opts.set_val(_this, input.val(), finished)
                } else {
                    _this.text(input.val());
                    return finished()
                }
            }
        }(this);
        $(document).on("click.edit_title", function(_this) {
            return function(e) {
                if (!$(e.target).closest(".inline_edit_input").length) {
                    return save()
                }
            }
        }(this));
        return input.on("keydown", function(_this) {
            return function(e) {
                switch (e.keyCode) {
                    case 9:
                        return _.defer(function() {
                            return save()
                        });
                    case 13:
                        return save();
                    case 27:
                        return finished()
                }
            }
        }(this))
    };
    I.support_passive_scroll = function() {
        var opts, supports;
        supports = false;
        try {
            opts = Object.defineProperty({}, "passive", {
                get: function(_this) {
                    return function() {
                        return supports = true
                    }
                }(this)
            });
            window.addEventListener("test", null, opts)
        } catch (error) {}
        return supports
    };
    I.support_intersection_observer = function() {
        return "IntersectionObserver" in window
    };
    show_images = function(item, make_promise) {
        var cell, cells, fn1, images, img, j, len, ref;
        item.removeClass("lazy_images");
        cells = item.find("[data-background_image]").addBack("[data-background_image]");
        images = function() {
            var j, len, results;
            results = [];
            for (j = 0, len = cells.length; j < len; j++) {
                cell = cells[j];
                results.push(function(cell) {
                    var image_url;
                    cell = $(cell);
                    image_url = cell.data("background_image");
                    cell.css({
                        backgroundImage: "url(" + image_url + ")"
                    });
                    if (make_promise) {
                        return $.Deferred(function(_this) {
                            return function(d) {
                                return $("<img />").attr("src", image_url).on("load", function() {
                                    return d.resolve()
                                })
                            }
                        }(this))
                    }
                }(cell))
            }
            return results
        }();
        ref = item.find("img[data-lazy_src]").addBack("img[data-lazy_src]");
        fn1 = function(img) {
            var image_url, srcset;
            img = $(img);
            image_url = img.data("lazy_src");
            img.attr("src", image_url);
            if (srcset = img.data("lazy_srcset")) {
                img.attr("srcset", srcset)
            }
            if (make_promise) {
                return $.Deferred(function(_this) {
                    return function(d) {
                        return img.on("load", function() {
                            return d.resolve()
                        })
                    }
                }(this))
            }
        };
        for (j = 0, len = ref.length; j < len; j++) {
            img = ref[j];
            fn1(img)
        }
        if (make_promise) {
            if (images.length === 1) {
                return images[0]
            } else {
                return $.when.apply($, images)
            }
        }
    };
    $.fn.lazy_images = function(opts) {
        var _show_images, check_images, el, handle_intersect, horizontal, io, j, lazy, len, ref, refresh, selector, target, throttled, unbind, win;
        if (refresh = this.data("lazy_images")) {
            return refresh()
        }
        lazy = (opts != null ? opts.elements : void 0) ? function() {
            var j, len, ref, results;
            ref = opts.elements;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
                el = ref[j];
                results.push($(el))
            }
            return results
        }() : (selector = (opts != null ? opts.selector : void 0) || ".lazy_images", function() {
            var j, len, ref, results;
            ref = this.find(selector);
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
                el = ref[j];
                results.push($(el))
            }
            return results
        }.call(this));
        _show_images = (ref = opts != null ? opts.show_images : void 0) != null ? ref : show_images;
        if (I.support_intersection_observer()) {
            handle_intersect = function(entities) {
                var d, entity, j, len, on_show, results;
                results = [];
                for (j = 0, len = entities.length; j < len; j++) {
                    entity = entities[j];
                    if (entity.isIntersecting) {
                        el = entity.target;
                        io.unobserve(el);
                        el = $(el);
                        on_show = opts != null ? opts.show_item : void 0;
                        d = _show_images(el, !!on_show);
                        results.push(typeof on_show === "function" ? on_show(el, d) : void 0)
                    } else {
                        results.push(void 0)
                    }
                }
                return results
            };
            io = new IntersectionObserver(handle_intersect, {});
            for (j = 0, len = lazy.length; j < len; j++) {
                el = lazy[j];
                io.observe(el[0])
            }
            return function() {
                return io.disconnect()
            }
        }
        win = $(window);
        target = opts != null ? opts.target : void 0;
        horizontal = opts != null ? opts.horizontal : void 0;
        unbind = null;
        check_images = function(_this) {
            return function() {
                var cuttoff, d, found, i, item, k, len1, on_show, position;
                cuttoff = function() {
                    if (target) {
                        if (horizontal) {
                            return target.outerWidth() + target.position().left
                        } else {
                            throw new Error("not yet")
                        }
                    } else {
                        return win.scrollTop() + win.height()
                    }
                }();
                found = 0;
                for (i = k = 0, len1 = lazy.length; k < len1; i = ++k) {
                    item = lazy[i];
                    if (!item) {
                        continue
                    }
                    if (!document.body.contains(item[0])) {
                        lazy[i] = null;
                        found += 1;
                        continue
                    }
                    position = function() {
                        if (target) {
                            if (horizontal) {
                                return item.position().left
                            } else {
                                throw new Error("not yet")
                            }
                        } else {
                            return item.offset().top
                        }
                    }();
                    if (!item[0].offsetParent) {
                        continue
                    }
                    if (position < cuttoff) {
                        on_show = opts != null ? opts.show_item : void 0;
                        d = _show_images(item, !!on_show);
                        if (typeof on_show === "function") {
                            on_show(item, d)
                        }
                        found += 1;
                        lazy[i] = null
                    }
                }
                if (found > 0) {
                    return lazy = function() {
                        var l, len2, results;
                        results = [];
                        for (l = 0, len2 = lazy.length; l < len2; l++) {
                            el = lazy[l];
                            if (el) {
                                results.push(el)
                            }
                        }
                        return results
                    }()
                }
            }
        }(this);
        throttled = _.throttle(check_images, 100);
        if (target) {
            target.on("scroll", throttled);
            win.on("resize", throttled);
            unbind = function() {
                target.off("scroll", throttled);
                return win.off("resize", "throttled")
            }
        } else {
            if (I.support_passive_scroll()) {
                window.addEventListener("scroll", throttled, {
                    passive: true
                });
                win.on("resize i:reshape", throttled);
                unbind = function() {
                    window.removeEventListener("scroll", throttled, {
                        passive: true
                    });
                    return win.off("resize", throttled)
                }
            } else {
                win.on("scroll resize i:reshape", throttled);
                unbind = function() {
                    return win.off("scroll resize i:reshape", throttled)
                }
            }
        }
        this.data("lazy_images", function(_this) {
            return function() {
                lazy = (opts != null ? opts.elements : void 0) ? function() {
                    var k, len1, ref1, results;
                    ref1 = opts.elements;
                    results = [];
                    for (k = 0, len1 = ref1.length; k < len1; k++) {
                        el = ref1[k];
                        results.push($(el))
                    }
                    return results
                }() : (selector = (opts != null ? opts.selector : void 0) || ".lazy_images", function() {
                    var k, len1, ref1, results;
                    ref1 = this.find(selector);
                    results = [];
                    for (k = 0, len1 = ref1.length; k < len1; k++) {
                        el = ref1[k];
                        results.push($(el))
                    }
                    return results
                }.call(_this));
                return check_images()
            }
        }(this));
        check_images();
        return unbind
    };
    $.fn.max_height = function(margin) {
        var padding, set_height, win;
        if (margin == null) {
            margin = 0
        }
        win = $(window);
        padding = this.outerHeight(true) - this.height();
        set_height = function(_this) {
            return function() {
                return _this.css("min-height", win.height() - padding - margin + "px")
            }
        }(this);
        win.on("resize", set_height);
        return set_height()
    };
    $.fn.remote_link = function(fn) {
        return this.on("click", "[data-remote]", function(_this) {
            return function(e) {
                var confirm_msg, el, href, method, params;
                e.preventDefault();
                el = $(e.currentTarget);
                if (el.is(".loading")) {
                    return
                }
                method = el.data("method") || "POST";
                params = I.with_csrf($.extend({}, el.data("params")));
                href = el.data("href") || el.attr("href");
                if (confirm_msg = el.data("confirm")) {
                    if (!confirm(confirm_msg)) {
                        return
                    }
                }
                el.addClass("loading").prop("disabled", true);
                $.ajax({
                    type: method,
                    url: href,
                    data: params,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(res) {
                    el.removeClass("loading").prop("disabled", false);
                    return typeof fn === "function" ? fn(res, el) : void 0
                });
                return null
            }
        }(this))
    };
    $.fn.remote_submit = function(fn, validate_fn, more_data) {
        var click_input;
        click_input = null;
        this.on("click", "button[name], input[type='submit'][name]", function(_this) {
            return function(e) {
                var btn;
                btn = $(e.currentTarget);
                if (click_input != null) {
                    click_input.remove()
                }
                return click_input = $("<input type='hidden' />").attr("name", btn.attr("name")).val(btn.attr("value")).prependTo(_this)
            }
        }(this));
        return this.on("submit", function(_this) {
            return function(e, callback) {
                var form;
                e.preventDefault();
                form = $(e.currentTarget);
                if (validate_fn) {
                    if (!(typeof validate_fn === "function" ? validate_fn(form) : void 0)) {
                        return
                    }
                }
                I.remote_submit(form, more_data).done(function(res) {
                    form.data("dirty", false);
                    if (callback != null) {
                        return callback(res, form)
                    } else {
                        return fn(res, form)
                    }
                });
                return null
            }
        }(this))
    };
    $.fn.remote_table = function() {
        var current_page, fill_page, max_page, xhr_cache;
        max_page = this.data("max_page");
        current_page = function(_this) {
            return function() {
                return _this.data("page") || 1
            }
        }(this);
        xhr_cache = {};
        fill_page = function(_this) {
            return function(page_num) {
                var table, xhr;
                if (_this.is(".loading")) {
                    return
                }
                if (!(1 <= page_num && page_num <= max_page)) {
                    return
                }
                table = _this.find("table");
                _this.addClass("loading").data("page", page_num).toggleClass("first_page", page_num === 1).toggleClass("last_page", page_num === max_page).find(".current_page").text(page_num);
                xhr = xhr_cache[page_num] || (xhr_cache[page_num] = $.get(_this.data("remote_url") + "?" + $.param({
                    page: page_num
                })));
                return xhr.done(function(res) {
                    _this.removeClass("loading");
                    return table.html(res.content)
                })
            }
        }(this);
        return this.dispatch("click", {
            next_page_btn: function(_this) {
                return function() {
                    return fill_page(current_page() + 1)
                }
            }(this),
            prev_page_btn: function(_this) {
                return function() {
                    return fill_page(current_page() - 1)
                }
            }(this)
        })
    };
    $.fn.set_form_errors = function(errors, scroll_to, msg) {
        var base, e, errors_el, errors_list, has_errors, j, len, lightbox;
        if (scroll_to == null) {
            scroll_to = true
        }
        if (msg == null) {
            msg = "Errors"
        }
        this.find(".form_errors").remove();
        has_errors = !!(errors != null ? errors.length : void 0);
        this.toggleClass("has_errors", has_errors);
        if (has_errors) {
            errors_el = $(_.template('<div class="form_errors">\n  <div>{{ msg }}:</div>\n  <ul></ul>\n</div>')({
                msg: msg
            }));
            errors_list = errors_el.find("ul");
            for (j = 0, len = errors.length; j < len; j++) {
                e = errors[j];
                errors_list.append($("<li></li>").text(e))
            }
            this.prepend(errors_el);
            if (scroll_to) {
                lightbox = this.closest(".lightbox");
                if (lightbox.length || this.offset().top > $(window).height() / 2) {
                    if (typeof(base = this[0]).scrollIntoView === "function") {
                        base.scrollIntoView()
                    }
                } else {
                    $("html, body").animate({
                        scrollTop: 0
                    }, "fast")
                }
            }
        }
        return this
    };
    $.fn.swap_with = function(other) {
        var new_offset, offset, other_new_offset, other_offset, other_placeholder, other_tag_name, placeholder, tag_name;
        other = $(other);
        if (!(this.length && other.length)) {
            return
        }
        offset = this.offset();
        other_offset = other.offset();
        tag_name = this.prop("tagName");
        other_tag_name = other.prop("tagName");
        placeholder = $("<" + tag_name + "></" + tag_name + ">").insertAfter(this);
        other_placeholder = $("<" + other_tag_name + "></" + other_tag_name + ">").insertAfter(other);
        placeholder.after(other);
        other_placeholder.after(this);
        new_offset = this.offset();
        other_new_offset = other.offset();
        other_placeholder.replaceWith(this.detach().css({
            position: "relative",
            top: offset.top - new_offset.top + "px",
            left: offset.left - new_offset.left + "px"
        }));
        placeholder.replaceWith(other.detach().css({
            position: "relative",
            top: other_offset.top - other_new_offset.top + "px",
            left: other_offset.left - other_new_offset.left + "px"
        }));
        return _.defer(function(_this) {
            return function() {
                _this.css({
                    top: "",
                    left: ""
                });
                return other.css({
                    top: "",
                    left: ""
                })
            }
        }(this))
    }
}).call(this);
(function() {
    var EMPTY, is_different, translation_component_cache, hasProp = {}.hasOwnProperty,
        slice = [].slice;
    if (window.R) {
        return
    }
    EMPTY = {};
    is_different = function(a, b) {
        var key;
        for (key in a) {
            if (!hasProp.call(a, key)) continue;
            if (a[key] !== b[key]) {
                return true
            }
        }
        for (key in b) {
            if (!hasProp.call(b, key)) continue;
            if (!(key in a)) {
                return true
            }
        }
        return false
    };
    translation_component_cache = {};
    window.R = function(name, data, p, prefix) {
        var cl, class_name, default_props, factory, prop_types;
        if (p == null) {
            p = R
        }
        if (prefix == null) {
            prefix = ""
        }
        if (p[name]) {
            return p[name]._class
        }
        data.trigger = function() {
            var node;
            node = $(ReactDOM.findDOMNode(this));
            R.trigger.apply(R, [node].concat(slice.call(arguments)));
            return void 0
        };
        data.dispatch = function() {
            var node;
            node = $(ReactDOM.findDOMNode(this));
            R.dispatch.apply(R, [node].concat(slice.call(arguments)));
            return void 0
        };
        data.container = function() {
            return $(ReactDOM.findDOMNode(this))
        };
        data.extend_props = function() {
            var more;
            more = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return $.extend.apply($, [{}, this.props].concat(slice.call(more)))
        };
        data.tt = function(key, props) {
            var text;
            if (props == null) {
                props = EMPTY
            }
            if (text = I.i18n.fetch_key_sync(key)) {
                if (_.isString(text)) {
                    return text
                }
            }
            translation_component_cache[key] || (translation_component_cache[key] = I.i18n.react_class(key));
            return React.createElement(translation_component_cache[key], props)
        };
        data.t = function(key, variables) {
            if (I.i18n.fetch_key_sync(key)) {
                return I.i18n.t_sync(key, variables)
            } else {
                I.i18n.fetch_key(key).done(function(_this) {
                    return function() {
                        if (_this.isMounted()) {
                            return _this.forceUpdate()
                        }
                    }
                }(this));
                return "…"
            }
        };
        class_name = _.once(function() {
            return ("" + prefix + name).replace(/[A-Z]/g, "_$&").replace(/\./g, "_").replace(/__+/g, "_").replace(/^_+/, "").replace(/_+$/, "").toLowerCase() + "_widget"
        });
        data.enclosing_class_name = class_name;
        data.enclose = function() {
            var args, component, props;
            props = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            component = props.component || "div";
            delete props.component;
            return React.createElement.apply(React, [component, $.extend({}, props, {
                className: classNames(class_name(), props.className)
            })].concat(slice.call(args)))
        };
        data.displayName = "" + prefix + name;
        if (data.pure) {
            data.shouldComponentUpdate = function(nextProps, nextState) {
                return is_different(this.props || EMPTY, nextProps) || is_different(this.state || EMPTY, nextState)
            }
        }
        default_props = data.getDefaultProps;
        delete data.getDefaultProps;
        prop_types = data.propTypes;
        delete data.propTypes;
        cl = createReactClass(data);
        if (default_props) {
            cl.defaultProps = default_props()
        }
        if (prop_types) {
            cl.propTypes = prop_types
        }
        factory = React.createElement.bind(null, cl);
        factory.type = cl;
        return p[name] = factory
    };
    R.scope_event_name = function(name) {
        return "chang:" + name
    };
    R.trigger = function() {
        var args, name, node;
        node = arguments[0], name = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return node.trigger(R.scope_event_name(name), slice.call(args))
    };
    R.dispatch = function(node, prefix, event_table) {
        var event_name, fn, results;
        if (typeof prefix === "object") {
            event_table = prefix;
            prefix = false
        }
        results = [];
        for (event_name in event_table) {
            if (!hasProp.call(event_table, event_name)) continue;
            fn = event_table[event_name];
            if (prefix) {
                event_name = prefix + ":" + event_name
            }
            results.push(node.on(R.scope_event_name(event_name), fn))
        }
        return results
    };
    R.component = function() {
        return R.apply(null, arguments)
    };
    R.is_different = is_different;
    R["package"] = function(_this) {
        return function(prefix) {
            var p;
            p = R[prefix] || (R[prefix] = function(name, data) {
                data.Package = p;
                return R.component(name, data, p, prefix + ".")
            });
            p.component = function() {
                return p.apply(null, arguments)
            };
            return p
        }
    }(this)
}).call(this);
(function() {
    var slice = [].slice,
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.Lightbox = function() {
        Lightbox.include_dependencies = function(deps) {
            var deferreds;
            if (!deps) {
                return []
            }
            deferreds = [];
            if (deps.redactor && !$.fn.redactor) {
                $("head").append(deps.redactor);
                deferreds.push(I.libs.redactor)
            }
            if (deps.selectize && !$.fn.selectize) {
                $("head").append(deps.selectize);
                deferreds.push(I.libs.selectize)
            }
            return deferreds
        };
        Lightbox.lightbox_container = function() {
            return this._container || (this._container = $("#lightbox_container").exists() || $('<div id="lightbox_container"></div>').appendTo("body"))
        };
        Lightbox.shroud_container = function() {
            return this._shroud || (this._shroud = $("#lightbox_shroud").exists() || $('<div id="lightbox_shroud"></div>').appendTo("body"))
        };
        Lightbox.show_shroud = function() {
            var shroud;
            if (this.shroud_visible) {
                return
            }
            if (!this._shroud) {
                shroud = this.shroud_container();
                this.lightbox_container().on("click", function(_this) {
                    return function(e) {
                        if (!$(e.target).closest(".lightbox").length) {
                            if ($(e.target).attr("href") === "javascript:void(0)") {
                                return
                            }
                            return _this.close()
                        }
                    }
                }(this));
                shroud.on("click", function(_this) {
                    return function() {
                        return _this.close()
                    }
                }(this));
                $(document.body).on("keydown", function(_this) {
                    return function(e) {
                        if (e.keyCode === 27) {
                            e.preventDefault();
                            e.stopPropagation();
                            return _this.close()
                        } else {
                            return _this.on_keydown(e)
                        }
                    }
                }(this));
                $(window).on("resize", function(_this) {
                    return function(e) {
                        return _this.on_resize(e)
                    }
                }(this))
            }
            this.shroud_visible = true;
            this.shroud_container().addClass("invisible").show();
            return _.defer(function(_this) {
                return function() {
                    return _this.shroud_container().removeClass("invisible")
                }
            }(this))
        };
        Lightbox.hide_shroud = function() {
            this.shroud_visible = false;
            return this.shroud_container().hide()
        };
        Lightbox.open_loading = function() {
            return this.open_tpl("loading_lightbox", I.Lightbox)
        };
        Lightbox.open_remote_react = function(url, init) {
            this.open_loading();
            return $.when(I.add_react(), $.ajax({
                dataType: "json",
                url: url,
                data: {
                    props: true
                },
                xhrFields: {
                    withCredentials: true
                },
                error: function(_this) {
                    return function(xhr, message, error) {
                        var res;
                        res = function() {
                            try {
                                return JSON.parse(xhr.responseText)
                            } catch (error1) {}
                        }();
                        if (res != null ? res.errors : void 0) {
                            alert(res.errors.join(","))
                        } else {
                            alert("Something went wrong. Please try again later and contact support if it persists.")
                        }
                        return _this.close()
                    }
                }(this)
            })).done(function(_this) {
                return function(res, arg) {
                    var deferreds, props;
                    props = arg[0];
                    if (props.errors) {
                        alert(props.errors.join(","));
                        _this.close();
                        return
                    }
                    deferreds = I.Lightbox.include_dependencies(props._dependencies);
                    return $.when.apply($, [init(props)].concat(slice.call(deferreds))).then(function(lb) {
                        if (lb) {
                            return I.Lightbox.open(lb)
                        } else {
                            return _this.close()
                        }
                    })
                }
            }(this))
        };
        Lightbox.open_remote = function() {
            var T, args, url;
            url = arguments[0], T = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
            if (T == null) {
                T = I.Lightbox
            }
            this.open_loading();
            return $.ajax({
                dataType: "json",
                url: url,
                data: {
                    lightbox: true
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function(_this) {
                    return function(res) {
                        if (res.errors) {
                            alert(res.errors.join(","));
                            _this.close();
                            return
                        }
                        return _this.open.apply(_this, [res.content, T].concat(slice.call(args)))
                    }
                }(this),
                error: function(_this) {
                    return function(xhr, message, error) {
                        alert("Something went wrong. Please try again later and contact support if it persists.");
                        return _this.close()
                    }
                }(this)
            })
        };
        Lightbox.open_tpl = function() {
            var args, el, tpl;
            tpl = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            el = $("#" + tpl + "_tpl");
            if (!el.length) {
                throw "missing template for lightbox: " + tpl
            }
            return this.open.apply(this, [el.html()].concat(slice.call(args)))
        };
        Lightbox.open_tpl_with_params = function() {
            var args, el, html, params, tpl;
            tpl = arguments[0], params = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
            el = $("#" + tpl + "_tpl");
            if (!el.length) {
                throw "missing template for lightbox: " + tpl
            }
            html = _.template(el.html())(params);
            return this.open.apply(this, [html].concat(slice.call(args)))
        };
        Lightbox.open = function() {
            var T, args, content, lightbox, lightbox_el, new_obj;
            content = arguments[0], T = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
            if (T == null) {
                T = I.Lightbox
            }
            if (this.current_lightbox) {
                this.current_lightbox.close();
                this.current_lightbox = null
            }
            new_obj = false;
            if (content.$$typeof) {
                new_obj = true;
                lightbox = new I.ReactLightbox(content, this)
            } else {
                if ("string" === typeof content) {
                    content = $.trim(content)
                }
                lightbox_el = $(content);
                if (!(lightbox = lightbox_el.data("object"))) {
                    new_obj = true;
                    lightbox = function(func, args, ctor) {
                        ctor.prototype = func.prototype;
                        var child = new ctor,
                            result = func.apply(child, args);
                        return Object(result) === result ? result : child
                    }(T, [lightbox_el, this].concat(slice.call(args)), function() {});
                    lightbox_el.data("object", lightbox)
                }
            }
            $(document.body).addClass("lightbox_open");
            this.show_shroud();
            lightbox.show(new_obj);
            this.current_lightbox = lightbox;
            return lightbox
        };
        Lightbox.close = function() {
            var ref;
            if (this.current_lightbox && !this.current_lightbox.is_closable()) {
                return
            }
            if (this.current_lightbox && this.current_lightbox.el.is(".has_changes")) {
                if (!confirm("You've have unsaved changes in this dialog. Are you sure you want to close it?")) {
                    return
                }
            }
            this.hide_shroud();
            if ((ref = this.current_lightbox) != null) {
                ref.close()
            }
            this.current_lightbox = null;
            return $(document.body).removeClass("lightbox_open")
        };
        Lightbox.on_keydown = function(e) {
            var ref, ref1;
            return (ref = this.current_lightbox) != null ? (ref1 = ref.el) != null ? ref1.trigger("i:lightbox_keydown", e) : void 0 : void 0
        };
        Lightbox.on_resize = function(e) {
            var ref, ref1;
            return (ref = this.current_lightbox) != null ? (ref1 = ref.el) != null ? ref1.trigger("i:lightbox_resize", e) : void 0 : void 0
        };
        Lightbox.prototype.lightbox_hidden = function(lb) {};

        function Lightbox() {
            var el, parent1, rest;
            el = arguments[0], parent1 = arguments[1], rest = 3 <= arguments.length ? slice.call(arguments, 2) : [];
            this.parent = parent1;
            this.el = $(el);
            this.el.on("click", ".close_button, .close_btn", function(_this) {
                return function(e) {
                    I.Lightbox.close();
                    return false
                }
            }(this));
            this.init.apply(this, rest)
        }
        Lightbox.prototype.init = function() {};
        Lightbox.prototype.first_show = function() {};
        Lightbox.prototype.with_selectize = function(fn) {
            var html;
            if (!$.fn.selectize) {
                html = this.el.data().selectize;
                if (!html) {
                    throw "missing selectize include in lightbox"
                }
                $("head").append(html)
            }
            return I.with_selectize(fn)
        };
        Lightbox.prototype.with_redactor = function(fn) {
            var html;
            if (!$.fn.redactor) {
                html = this.el.data().redactor;
                if (!html) {
                    throw "missing redactor include in lightbox"
                }
                $("head").append(html)
            }
            return I.with_redactor(fn)
        };
        Lightbox.prototype.show = function(first_time) {
            var el, i, len, ref;
            this.el.appendTo(this.parent.lightbox_container()).addClass("animated").show().trigger("i:lightbox_open");
            this.position();
            if (first_time) {
                ref = this.el.find("[data-js_init]");
                for (i = 0, len = ref.length; i < len; i++) {
                    el = ref[i];
                    eval($(el).data("js_init"))
                }
                return this.first_show()
            }
        };
        Lightbox.prototype.close = function() {
            return this.el.removeClass("animated").hide().trigger("i:lightbox_close").remove()
        };
        Lightbox.prototype.position = function() {
            var top;
            top = "fixed" === this.parent.lightbox_container().css("position") ? "" : $(window).scrollTop() + "px";
            return this.el.css({
                top: top
            })
        };
        Lightbox.prototype.closable = true;
        Lightbox.prototype.is_closable = function() {
            return this.closable
        };
        return Lightbox
    }();
    I.ReactLightbox = function(superClass) {
        extend(ReactLightbox, superClass);

        function ReactLightbox() {
            var component, el, parent, rest, wrapper;
            component = arguments[0], parent = arguments[1], rest = 3 <= arguments.length ? slice.call(arguments, 2) : [];
            wrapper = $('<div class="react_lightbox"></div>').appendTo(parent.lightbox_container());
            this.react_component = ReactDOM.render(component, wrapper[0]);
            el = ReactDOM.findDOMNode(this.react_component);
            ReactLightbox.__super__.constructor.apply(this, [el, parent].concat(slice.call(rest)))
        }
        ReactLightbox.prototype.show = function(first_time) {
            this.el.addClass("animated");
            return this.position()
        };
        ReactLightbox.prototype.close = function() {
            var parent;
            this.el.trigger("i:lightbox_close");
            parent = this.el.parent();
            ReactDOM.unmountComponentAtNode(parent[0]);
            return parent.remove()
        };
        return ReactLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.CollectionLightbox = function(superClass) {
        extend(CollectionLightbox, superClass);

        function CollectionLightbox() {
            return CollectionLightbox.__super__.constructor.apply(this, arguments)
        }
        CollectionLightbox.prototype.init = function() {
            var form;
            I.has_follow_button(this.el);
            I.event2("view add to collection lightbox");
            this.el.find("input[type='radio']:first").prop("checked", true);
            this.el.on("click change", ".collection_option", function(_this) {
                return function(e) {
                    var row;
                    row = $(e.currentTarget);
                    return row.find("input[type='radio']").prop("checked", true)
                }
            }(this));
            form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    if (res.errors) {
                        if (I.add_recaptcha_if_necessary(form, res.errors)) {
                            return
                        }
                        form.set_form_errors(res.errors);
                        return
                    }
                    _this.el.addClass("is_complete");
                    return _this.el.find(".after_submit .collection_name").text(res.title).attr("href", res.url)
                }
            }(this));
            this.with_redactor(function(_this) {
                return function() {
                    return I.redactor(_this.el.find("textarea"), {
                        minHeight: 40,
                        source: false,
                        buttons: ["bold", "italic", "deleted", "lists", "link"]
                    })
                }
            }(this));
            return this.with_selectize(function(_this) {
                return function() {
                    return _this.el.find("select.collection_input").selectize()
                }
            }(this))
        };
        return CollectionLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.AfterDownloadLightbox = function(superClass) {
        extend(AfterDownloadLightbox, superClass);

        function AfterDownloadLightbox() {
            return AfterDownloadLightbox.__super__.constructor.apply(this, arguments)
        }
        AfterDownloadLightbox.prototype.init = function(game, opts) {
            var grid;
            this.game = game;
            if (opts == null) {
                opts = {}
            }
            I.event(opts.page_name || "view_game", "after_download_lb", "" + this.game.id);
            grid = this.el.find(".game_grid_widget");
            new I.GameGrid(grid, {
                expected_size: 240,
                selector: ".after_download_lightbox_widget .game_cell .game_thumb",
                width_selector: ".after_download_lightbox_widget .game_cell"
            });
            I.setup_grid_referrers(this.el, function(_this) {
                return function() {
                    return "after_download:" + _this.game.id
                }
            }(this));
            I.tracked_links(this.el, "after_download_lb");
            return I.has_follow_button(this.el)
        };
        return AfterDownloadLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    var bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments)
            }
        },
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.BaseBuyForm = function() {
        BaseBuyForm.prototype.event_category = "buy_form";
        BaseBuyForm.prototype.pay_in_popup = false;
        BaseBuyForm.prototype.min_price = 100;

        function BaseBuyForm(el, opts1) {
            var medium, source;
            this.opts = opts1 != null ? opts1 : {};
            this.billing_address_valid = bind(this.billing_address_valid, this);
            this.show_billing_address_form = bind(this.show_billing_address_form, this);
            this.show_vat_form = bind(this.show_vat_form, this);
            this.submit_handler = bind(this.submit_handler, this);
            this.checkout_btn_handler = bind(this.checkout_btn_handler, this);
            this.set_fingerprint = bind(this.set_fingerprint, this);
            this.el = $(el);
            this.el.find("input[name=csrf_token][value='']").val($("meta[name=csrf_token]").attr("value"));
            this.form = this.el.find("form");
            this.opts = $.extend({}, this.form.data("opts"), this.opts);
            this.set_fingerprint();
            this.input = this.form.find("input.money_input");
            if (this.input.length) {
                I.money_input(this.input)
            }
            this.form.on("submit", function(_this) {
                return function() {
                    return _this.submit_handler.apply(_this, arguments)
                }
            }(this));
            this.el.dispatch("click", {
                add_btn: function(_this) {
                    return function(btn) {
                        var amount;
                        amount = +btn.attr("data-amount");
                        _this.track_add_btn(amount);
                        _this.input.val(I.format_money(_this.get_value() + amount, _this.get_currency()));
                        return _this.update_items()
                    }
                }(this),
                billing_back_btn: function(_this) {
                    return function() {
                        _this.form.find(".checkout_btn").prop("disabled", false);
                        return _this.form.removeClass("show_billing_address_form")
                    }
                }(this),
                vat_back_btn: function(_this) {
                    return function() {
                        _this.form.removeClass("show_vat_confirm");
                        return _this.show_billing_address_form()
                    }
                }(this),
                direct_download_btn: function(_this) {
                    return function() {
                        return _this.direct_download()
                    }
                }(this),
                save_billing_btn: function(_this) {
                    return function(e) {
                        if (!_this.billing_address_valid()) {
                            return
                        }
                        if (_this.opts.collect_vat) {
                            return _this.show_vat_form()
                        } else {
                            return _this.form.submit()
                        }
                    }
                }(this),
                confirm_vat_btn: function(_this) {
                    return function(e) {
                        return _this.form.submit()
                    }
                }(this)
            });
            this.el.on("click", ".checkout_btn", function(_this) {
                return function(e) {
                    return _this.checkout_btn_handler(e)
                }
            }(this));
            I.format_dates(this.el);
            if (source = this.opts.pick_source) {
                medium = this.opts.pick_medium || "default";
                this.el.find("[data-source='" + source + "'][data-medium='" + medium + "']").click()
            }
        }
        BaseBuyForm.prototype.set_fingerprint = function() {
            if (!window.Fingerprint2) {
                return false
            }
            this.set_fingerprint = function() {};
            return (new Fingerprint2).get(function(_this) {
                return function(res) {
                    if (res) {
                        return _this.form.find(".bp_input").val(res)
                    }
                }
            }(this))
        };
        BaseBuyForm.prototype.checkout_btn_handler = function(e) {
            var source;
            source = this.set_source(e);
            if (this.opts.collect_billing_address) {
                if (this.is_valid()) {
                    this.show_billing_address_form()
                }
                return false
            }
        };
        BaseBuyForm.prototype.submit_handler = function() {
            if (!this.is_valid()) {
                return false
            }
            if (this.form.attr("target") === "_blank") {
                return this.form.removeClass("show_vat_confirm show_billing_address_form").addClass("show_purchase_complete")
            }
        };
        BaseBuyForm.prototype.show_vat_form = function() {
            var country, inputs, price;
            if (!this.form.is(".show_billing_address_form")) {
                throw "billing form not visible"
            }
            inputs = this.form.addClass("loading").find(".billing_address_view").find("input[type='text'], select, button");
            inputs.prop("disabled", true);
            price = this.form.find("[name='price']").val();
            country = this.form.find("[name='address[country]']").val();
            return $.ajax({
                type: "GET",
                url: this.opts.tax_preview_url,
                data: {
                    price: price,
                    country: country
                },
                async: false
            }).then(function(_this) {
                return function(res) {
                    var error, f, field, i, len, ref, vat_preview;
                    inputs.prop("disabled", false);
                    _this.form.removeClass("loading has_vat_error");
                    if (res.errors) {
                        error = res.errors[0];
                        switch (error) {
                            case "country mismatch":
                                I.event(_this.event_category, "vat", "country_mismatch");
                                _this.form.removeClass("show_billing_address_form").addClass("show_vat_confirm has_vat_error");
                                break;
                            default:
                                I.event(_this.event_category, "error", JSON.stringify(res.errors));
                                _this.form.find(".generic_error_description").text(res.errors[0]);
                                _this.form.removeClass("show_billing_address_form").addClass("show_vat_confirm has_generic_error")
                        }
                        return
                    }
                    if (!res.rate || res.tax === 0) {
                        _this.form.submit();
                        return
                    }
                    _this.form.removeClass("show_billing_address_form").addClass("show_vat_confirm");
                    if (!_this._seen_vat) {
                        I.event(_this.event_category, "vat", "show_tax_preview");
                        _this._seen_vat = true
                    }
                    vat_preview = _this.form.find(".vat_view");
                    ref = vat_preview.find("[data-field]");
                    for (i = 0, len = ref.length; i < len; i++) {
                        field = ref[i];
                        f = $(field);
                        f.text(res[f.data("field")] || "")
                    }
                    return vat_preview.toggleClass("no_tip", !res.tip || res.tip === 0)
                }
            }(this))
        };
        BaseBuyForm.prototype.show_billing_address_form = function() {
            if (!this._seen_billing) {
                I.event(this.event_category, "vat", "show_billing");
                this._seen_billing = true
            }
            this.form.find(".checkout_btn").prop("disabled", true);
            return this.form.addClass("show_billing_address_form")
        };
        BaseBuyForm.prototype.set_source = function(e) {
            var btn, medium, source;
            btn = $(e.currentTarget).closest(".checkout_btn");
            if (!btn.length) {
                btn = (this._checkout_btns || (this._checkout_btns = this.form.find(".checkout_btn"))).first()
            }
            source = btn.data("source");
            (this._source_input || (this._source_input = this.form.find(".source_input"))).val(source);
            medium = btn.data("medium");
            (this._medium_input || (this._medium_input = this.form.find(".medium_input"))).val(medium || "");
            return source
        };
        BaseBuyForm.prototype.set_loading = function(is_loading) {
            this.form.toggleClass("loading", is_loading);
            this.el.toggleClass("loading", is_loading);
            this.input.prop("disabled", is_loading);
            (this.add_buttons || (this.add_buttons = this.form.find(".add_btn"))).toggleClass("disabled", is_loading);
            return this.el.triggerHandler("i:loading", is_loading)
        };
        BaseBuyForm.prototype.has_money_input = function() {
            return !!this.input.length
        };
        BaseBuyForm.prototype.get_value = function() {
            return I.parse_money(this.input.val())
        };
        BaseBuyForm.prototype.get_currency = function() {
            return this.input.data("currency")
        };
        BaseBuyForm.prototype._clean_error_message = function(msg) {
            if (msg === "paypal failed") {
                msg = "Failed to create PayPal transaction, please try again later."
            }
            return msg
        };
        BaseBuyForm.prototype.set_error = function(msg) {
            msg = this._clean_error_message(msg);
            this.error_text || (this.error_text = this.el.find(".error_text"));
            if (msg) {
                this.form.addClass("has_error");
                return this.error_text.text(msg)
            } else {
                return this.form.removeClass("has_error")
            }
        };
        BaseBuyForm.prototype.remote_submit = function(e) {
            var data, popup, ref;
            if (!this.is_valid()) {
                return false
            }
            data = this.form.serializeArray();
            data.push({
                name: "json",
                value: "true"
            });
            this.set_loading(true);
            this.track_remote_submit();
            if (this.pay_in_popup) {
                popup = window.open();
                if ((ref = popup.document) != null) {
                    ref.write("Loading...")
                }
                _.defer(function(_this) {
                    return function() {
                        var ref1;
                        return (ref1 = popup.document) != null ? ref1.title = "Loading..." : void 0
                    }
                }(this))
            }
            this.el.trigger("i:buy_start", [data]);
            $.ajax({
                url: this.form.attr("action"),
                type: "POST",
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                success: function(_this) {
                    return function(res) {
                        if (res.url) {
                            if (popup) {
                                popup.location = res.url;
                                _this.set_loading(false)
                            } else {
                                window.top.location = res.url
                            }
                            return _this.el.trigger("i:buy_complete", [res])
                        } else {
                            if (popup) {
                                popup.close()
                            }
                            _this.form.removeClass("show_billing_address_form show_vat_confirm");
                            _this.set_error(res.errors.join(","));
                            return _this.set_loading(false)
                        }
                    }
                }(this)
            });
            return false
        };
        BaseBuyForm.prototype.is_valid = function() {
            var value;
            if (this.has_money_input()) {
                value = this.get_value();
                if (value < this.min_price) {
                    this.set_error("Due to processing fees the minimum amount is 100 cents.");
                    return false
                }
            }
            this.set_error();
            return true
        };
        BaseBuyForm.prototype.billing_address_valid = function() {
            return this.el.find(".billing_address_form_widget").data("object").check_valid()
        };
        BaseBuyForm.prototype.track_add_btn = function(amount) {};
        BaseBuyForm.prototype.track_remote_submit = function() {};
        BaseBuyForm.prototype.update_items = function() {};
        return BaseBuyForm
    }();
    I.BuyForm = function(superClass) {
        extend(BuyForm, superClass);
        BuyForm.prototype.download_url = function() {
            if (I.subdomain) {
                return "/" + this.game.slug + "/download_url"
            } else {
                return "/game/download_url/" + this.game.id
            }
        };
        BuyForm.prototype.track_add_btn = function(amount) {
            return I.event(this.event_category, "add_" + amount, "" + this.game.id)
        };
        BuyForm.prototype.track_remote_submit = function() {
            return I.event(this.event_category, "purchase", "" + this.game.id, this.get_value())
        };

        function BuyForm(el, game1, opts) {
            var ref;
            this.game = game1;
            this.setup_filelist = bind(this.setup_filelist, this);
            this.download_url = bind(this.download_url, this);
            BuyForm.__super__.constructor.call(this, el, opts);
            this.setup_filelist();
            this.pay_in_popup = (ref = opts != null ? opts.pay_in_popup : void 0) != null ? ref : this.game.type_name !== "default";
            if (!this.pay_in_popup) {
                this.pay_in_popup = "_blank" === $("base[target]").attr("target")
            }
        }
        BuyForm.prototype.update_items = function() {
            var file, files, i, len, min, ref, results, val;
            if (!((ref = this.file_list) != null ? ref.length : void 0)) {
                return
            }
            val = val || this.get_value();
            files = this.file_list.find(".file_row");
            results = [];
            for (i = 0, len = files.length; i < len; i++) {
                file = files[i];
                file = $(file);
                min = file.data("min_price");
                results.push(file.toggleClass("inactive", !!(min && val < min)))
            }
            return results
        };
        BuyForm.prototype.setup_filelist = function() {
            this.file_list = this.el.find(".file_list");
            if (!this.file_list.length) {
                return
            }
            this.el.on("keyup blur", ".money_input", function(_this) {
                return function() {
                    return _this.update_items()
                }
            }(this));
            this.file_list.on("click", ".inactive", function(_this) {
                return function(e) {
                    var min, row;
                    I.event(_this.event_category, "pick_file", "" + _this.game.id);
                    row = $(e.currentTarget);
                    min = row.data("min_price");
                    if (min) {
                        _this.el.trigger("i:show_checkout");
                        _this.input.val(I.format_money(min, _this.get_currency()));
                        return _this.update_items()
                    }
                }
            }(this));
            this.el.find(".file_size_value").html(function() {
                return _.str.formatBytes(parseInt($(this).html(), 10))
            });
            return this.update_items()
        };
        BuyForm.prototype.direct_download = function() {
            var popup;
            I.event(this.event_category, "skip_buy", "" + this.game.id);
            this.set_loading(true);
            if (this.pay_in_popup) {
                popup = window.open();
                popup.document.write("Loading...");
                _.defer(function(_this) {
                    return function() {
                        return popup.document.title = "Loading..."
                    }
                }(this))
            }
            return $.ajax({
                url: this.download_url(),
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: I.with_csrf({
                    reward_id: this.opts.reward_id
                }),
                success: function(_this) {
                    return function(res) {
                        if (res.url) {
                            if (popup) {
                                popup.location = res.url;
                                return _this.set_loading(false)
                            } else {
                                return window.top.location = res.url
                            }
                        } else {
                            _this.set_error("There was an error generating the download URL, please try again.");
                            return _this.set_loading(false)
                        }
                    }
                }(this)
            })
        };
        BuyForm.prototype.is_valid = function() {
            var formatted, value;
            if (this.has_money_input()) {
                value = this.get_value();
                if (!this.opts.is_donate) {
                    if (value === 0 && this.game.actual_price === 0) {
                        this.set_error();
                        this.direct_download();
                        return false
                    }
                    if (value < this.game.actual_price) {
                        formatted = I.format_money(this.game.actual_price, this.get_currency());
                        this.set_error("You must pay at least " + formatted + ".");
                        return false
                    }
                }
            }
            if (!BuyForm.__super__.is_valid.apply(this, arguments)) {
                return
            }
            return true
        };
        return BuyForm
    }(I.BaseBuyForm);
    I.BundleBuyForm = function(superClass) {
        extend(BundleBuyForm, superClass);
        BundleBuyForm.prototype.event_category = "bundle_buy_form";

        function BundleBuyForm(el, bundle, opts) {
            this.bundle = bundle;
            this.setup_gamelist = bind(this.setup_gamelist, this);
            this.download_url = bind(this.download_url, this);
            BundleBuyForm.__super__.constructor.call(this, el, opts);
            this.setup_gamelist()
        }
        BundleBuyForm.prototype.download_url = function() {
            return "/bundle/" + this.bundle.id + "/download_url"
        };
        BundleBuyForm.prototype.direct_download = function() {
            I.event(this.event_category, "skip_buy", "" + this.bundle.id);
            this.set_loading(true);
            return $.ajax({
                url: this.download_url(),
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: I.with_csrf(),
                success: function(_this) {
                    return function(res) {
                        if (res.url) {
                            return window.top.location = res.url
                        } else {
                            _this.set_error("There was an error generating the download URL, please try again.");
                            return _this.set_loading(false)
                        }
                    }
                }(this)
            })
        };
        BundleBuyForm.prototype.setup_gamelist = function() {
            this.game_list = this.el.find(".game_list");
            if (!this.game_list.length) {
                return
            }
            this.el.on("keyup blur", ".money_input", function(_this) {
                return function() {
                    return _this.update_items()
                }
            }(this));
            this.game_list.on("click", ".inactive", function(_this) {
                return function(e) {
                    var min, row;
                    I.event(_this.event_category, "pick_game", "" + _this.bundle.id);
                    row = $(e.currentTarget);
                    min = row.data("min_price");
                    if (min) {
                        _this.el.trigger("i:show_checkout");
                        _this.input.val(I.format_money(min, _this.get_currency()));
                        return _this.update_items()
                    }
                }
            }(this));
            return this.update_items()
        };
        BundleBuyForm.prototype.update_items = function() {
            var available, count, game, games, header_drop, i, len, min, ref, val;
            if (!((ref = this.game_list) != null ? ref.length : void 0)) {
                return
            }
            val = this.get_value();
            games = this.game_list.find(".game_row");
            count = 0;
            for (i = 0, len = games.length; i < len; i++) {
                game = games[i];
                game = $(game);
                min = game.data("min_price");
                available = !(min && val < min);
                game.toggleClass("inactive", !available);
                if (available) {
                    count += 1
                }
            }
            header_drop = this.el.find(".game_list_header_drop")[0];
            if (header_drop) {
                return ReactDOM.render(R.BundleBuyForm.AvailableItems({
                    tiers: this.bundle.tiers,
                    group_noun: this.bundle.group_noun,
                    price: val,
                    currency: this.get_currency()
                }), header_drop)
            }
        };
        BundleBuyForm.prototype.is_valid = function() {
            var formatted, value;
            value = this.get_value();
            if (value < this.bundle.actual_price) {
                formatted = I.format_money(this.bundle.actual_price, this.get_currency());
                this.set_error("You must pay at least " + formatted + ".");
                return false
            }
            if (!BundleBuyForm.__super__.is_valid.apply(this, arguments)) {
                return
            }
            return true
        };
        return BundleBuyForm
    }(I.BaseBuyForm);
    I.BuyPopup = function(superClass) {
        extend(BuyPopup, superClass);

        function BuyPopup() {
            BuyPopup.__super__.constructor.apply(this, arguments);
            this.check_height();
            this.pay_in_popup = false
        }
        BuyPopup.prototype.check_height = function() {
            var missing_y, padding, win;
            padding = 32;
            win = $(window);
            missing_y = $(document.body).height() + padding - $(window).height();
            if (missing_y > 0) {
                return window.resizeTo(window.outerWidth, window.outerHeight + missing_y)
            }
        };
        return BuyPopup
    }(I.BuyForm);
    I.BillingAddressForm = function() {
        function BillingAddressForm(el) {
            this.check_valid = bind(this.check_valid, this);
            var country, input;
            this.el = $(el);
            this.el.data("object", this);
            country = this.el.find("[data-country_value]");
            if (country.length) {
                input = country.find("select");
                input.find("[value='" + country.data("country_value") + "']").prop("selected", true)
            }
        }
        BillingAddressForm.prototype.check_valid = function() {
            var i, input, len, pat, pattern, ref, val, valid;
            ref = this.el.find("input[required]");
            for (i = 0, len = ref.length; i < len; i++) {
                input = ref[i];
                input = $(input);
                val = input.val();
                input.toggleClass("has_error", !!val.match(/^\s*$/));
                if (pattern = input.attr("pattern")) {
                    pat = new RegExp("^" + pattern + "$");
                    input.toggleClass("has_error", !val.match(pat))
                }
            }
            valid = this.el.find(".has_error").length === 0;
            this.el.toggleClass("has_errors", !valid);
            return valid
        };
        return BillingAddressForm
    }()
}).call(this);
(function() {
    I.GameCarousel = function() {
        GameCarousel.prototype.edge_threshold = 5;
        GameCarousel.prototype.margin = 20;
        GameCarousel.prototype.inner_padding = 10;
        GameCarousel.prototype.paddle_margin_bottom = 30;
        GameCarousel.prototype.cell_class = ".game_cell";

        function GameCarousel(el, opts) {
            this.el = $(el);
            $.extend(this, opts);
            this.scroll_outer = this.el.find(".scrolling_outer");
            this.scroll_inner = this.el.find(".scrolling_inner");
            this.paddles = this.el.find(".paddle_next, .paddle_prev");
            if (I.is_mobile()) {
                this.el.find(".scrollbar_outer").remove();
                this.paddles.remove()
            } else {
                this.setup_scrollbar()
            }
            new I.GameCells(this.el);
            this.el.dispatch("click", {
                paddle_next: function(_this) {
                    return function(btn) {
                        _this.scroll_to(_this.cell_offset(_this.current_cell() + 3));
                        return btn.trigger("i:track_link")
                    }
                }(this),
                paddle_prev: function(_this) {
                    return function(btn) {
                        _this.scroll_to(_this.cell_offset(_this.current_cell() - 3));
                        return btn.trigger("i:track_link")
                    }
                }(this)
            });
            this.update_height();
            $(window).on("resize", _.debounce(function(_this) {
                return function() {
                    return _this.update_scrollbar()
                }
            }(this), 100));
            this.el.on("i:carousel:update_scrollbar", function(_this) {
                return function() {
                    return _this.update_scrollbar()
                }
            }(this));
            _.defer(function(_this) {
                return function() {
                    _this.el.addClass("ready");
                    return _this.update_height()
                }
            }(this))
        }
        GameCarousel.prototype.tallest_child = function() {
            var c, h, i, j, len, ref, tallest, tallest_height;
            tallest = null;
            tallest_height = null;
            ref = this.scroll_inner.children();
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                c = ref[i];
                c = $(c);
                if (tallest) {
                    h = c.outerHeight(true);
                    if (h > tallest_height) {
                        tallest = c;
                        tallest_height = h
                    }
                } else {
                    tallest = c;
                    tallest_height = c.outerHeight(true)
                }
            }
            return tallest
        };
        GameCarousel.prototype.update_height = function() {
            var inner_height, tallest_child;
            tallest_child = this.tallest_child();
            inner_height = tallest_child.outerHeight(true);
            inner_height += this.inner_padding * 2;
            this.scroll_outer.css({
                height: inner_height + "px"
            });
            this.paddles.css({
                height: inner_height - this.paddle_margin_bottom + "px"
            });
            return this.update_scrollbar()
        };
        GameCarousel.prototype.setup_scrollbar = function() {
            this.have_scrollbar = true;
            this.scrollbar_outer = this.el.find(".scrollbar_outer");
            this.scrollbar_inner = this.el.find(".scrollbar_inner");
            this.scroll_inner.on("scroll", function(_this) {
                return function() {
                    return _this.update_scrollbar()
                }
            }(this));
            this.scrollbar_inner.draggable({
                move: function(_this) {
                    return function(dx, dy) {
                        if (!_this.unit_scroll) {
                            return
                        }
                        return _this.scroll_inner[0].scrollLeft += dx * _this.unit_scroll
                    }
                }(this)
            });
            return this.update_scrollbar()
        };
        GameCarousel.prototype.current_cell = function() {
            var cell, cells, half, i, j, len;
            cells = this.el.find(this.cell_class);
            half = Math.floor(cells.width() / 2);
            for (i = j = 0, len = cells.length; j < len; i = ++j) {
                cell = cells[i];
                if ($(cell).position().left + half >= 0) {
                    return i
                }
            }
            return 0
        };
        GameCarousel.prototype.cell_offset = function(n) {
            var el, max, offset;
            n = Math.max(0, n);
            el = this.el.find(this.cell_class + ":eq(" + n + ")");
            max = this.max_scroll();
            offset = el.length ? el.position().left + this.scroll_pos() - this.margin : max;
            return Math.min(offset, max)
        };
        GameCarousel.prototype.scroll_to = function(pos) {
            var current_pos, delta;
            if (this.scroll_inner.is(":animated")) {
                return
            }
            current_pos = this.scroll_pos();
            delta = Math.abs(current_pos - pos);
            return this.scroll_inner.animate({
                scrollLeft: pos
            }, delta / 2)
        };
        GameCarousel.prototype.scroll_pos = function() {
            return this.scroll_inner[0].scrollLeft
        };
        GameCarousel.prototype.max_scroll = function() {
            return this.scroll_inner[0].scrollWidth - this.scroll_outer.innerWidth()
        };
        GameCarousel.prototype.update_scrollbar = function() {
            var has_scrollbar, inner_width, outer_width, scroll_pos;
            if (!this.have_scrollbar) {
                return
            }
            outer_width = this.scroll_outer.innerWidth();
            inner_width = this.scroll_inner[0].scrollWidth;
            has_scrollbar = inner_width - outer_width > this.edge_threshold;
            this.el.toggleClass("no_scrollbar", !has_scrollbar);
            if (has_scrollbar) {
                scroll_pos = this.scroll_pos();
                this.scrollbar_inner.css({
                    width: 100 * outer_width / inner_width + "%",
                    left: 100 * scroll_pos / inner_width + "%"
                });
                this.unit_scroll = inner_width / this.scroll_outer.width();
                this.el.toggleClass("on_left", scroll_pos <= this.edge_threshold);
                return this.el.toggleClass("on_right", scroll_pos >= this.max_scroll() - this.edge_threshold)
            } else {
                return this.el.removeClass("on_left on_right")
            }
        };
        return GameCarousel
    }()
}).call(this);
(function() {
    var _hex_piece, hex_color, hsl_to_rgb, luma, mix_color, parse_color, parse_color_safe, readable_text_color, rgb_helper, rgb_to_hsl, rgb_to_yuv, scale_luma, sub_color, sub_color2, yuv_to_rgb, slice = [].slice;
    rgb_helper = function(comp, temp1, temp2) {
        if (comp < 0) {
            comp += 1
        } else if (comp > 1) {
            comp -= 1
        }
        if (6 * comp < 1) {
            return temp1 + (temp2 - temp1) * 6 * comp
        } else if (2 * comp < 1) {
            return temp2
        } else if (3 * comp < 2) {
            return temp1 + (temp2 - temp1) * (2 / 3 - comp) * 6
        } else {
            return temp1
        }
    };
    hsl_to_rgb = function(h, s, l) {
        var b, g, r, temp1, temp2;
        h = h / 360;
        s = s / 100;
        l = l / 100;
        if (s === 0) {
            r = l;
            g = l;
            b = l
        } else {
            temp2 = l < .5 ? l * (1 + s) : l + s - l * s;
            temp1 = 2 * l - temp2;
            r = rgb_helper(h + 1 / 3, temp1, temp2);
            g = rgb_helper(h, temp1, temp2);
            b = rgb_helper(h - 1 / 3, temp1, temp2)
        }
        return [r * 255, g * 255, b * 255]
    };
    rgb_to_hsl = function(r, g, b) {
        var h, l, max, min, s;
        r = r / 255;
        g = g / 255;
        b = b / 255;
        min = Math.min(r, g, b);
        max = Math.max(r, g, b);
        s = 0;
        h = 0;
        l = (min + max) / 2;
        if (min !== max) {
            s = l < .5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
            h = function() {
                switch (max) {
                    case r:
                        return (g - b) / (max - min);
                    case g:
                        return 2 + (b - r) / (max - min);
                    case b:
                        return 4 + (r - g) / (max - min)
                }
            }()
        }
        if (h < 0) {
            h += 6
        }
        return [h * 60, s * 100, l * 100]
    };
    parse_color = function() {
        var _, b, g, hex, hexhex, m, r, rest, six, str, three;
        str = arguments[0], rest = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        hex = "[a-fA-f0-9]";
        hexhex = hex + hex;
        three = "^#(" + hex + ")(" + hex + ")(" + hex + ")$";
        six = "^#(" + hexhex + ")(" + hexhex + ")(" + hexhex + ")$";
        m = str.match(new RegExp(three));
        if (m) {
            _ = m[0], r = m[1], g = m[2], b = m[3];
            r += r;
            g += g;
            b += b
        } else {
            m = str.match(new RegExp(six));
            if (!m) {
                return null
            }
            _ = m[0], r = m[1], g = m[2], b = m[3]
        }
        return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
    };
    parse_color_safe = function() {
        var color;
        color = parse_color.apply(null, arguments);
        return color || [0, 0, 0]
    };
    _hex_piece = function(i) {
        var hex;
        hex = Math.floor(i).toString(16);
        if (hex.length === 1) {
            return "0" + hex
        } else {
            return hex
        }
    };
    hex_color = function(r, g, b) {
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        return "#" + _hex_piece(r) + _hex_piece(g) + _hex_piece(b)
    };
    sub_color = function(color, delta, sat_mul) {
        var h, l, new_l, ref, s;
        if (delta == null) {
            delta = 15
        }
        if (sat_mul == null) {
            sat_mul = .8
        }
        ref = rgb_to_hsl.apply(null, parse_color_safe(color)), h = ref[0], s = ref[1], l = ref[2];
        new_l = l > 50 ? l - delta : l + delta;
        new_l = Math.max(0, Math.min(100, new_l));
        return hex_color.apply(null, hsl_to_rgb(h, s * sat_mul, new_l))
    };
    luma = function(r, g, b) {
        return (.299 * r + .587 * g + .114 * b) / 255
    };
    rgb_to_yuv = function(r, g, b) {
        var u, v, y;
        y = .299 * r + .587 * g + .114 * b;
        u = (b - y) * .565;
        v = (r - y) * .713;
        return [y, u, v]
    };
    yuv_to_rgb = function(y, u, v) {
        var b, g, r;
        r = y + 1.403 * v;
        g = y - .344 * u - .714 * v;
        b = y + 1.77 * u;
        return [r, g, b]
    };
    scale_luma = function(r, g, b, p) {
        var ref, u, v, y;
        if (p == null) {
            p = .1
        }
        ref = rgb_to_yuv(r, g, b), y = ref[0], u = ref[1], v = ref[2];
        if (p < 0) {
            y += p * y
        } else {
            y += p * (255 - y)
        }
        return yuv_to_rgb(y, u, v)
    };
    readable_text_color = function(r, g, b) {
        var h, l, ref, ref1, s;
        if (typeof r === "string") {
            ref = parse_color_safe(r), r = ref[0], g = ref[1], b = ref[2]
        }
        ref1 = rgb_to_hsl(r, g, b), h = ref1[0], s = ref1[1], l = ref1[2];
        return l >= 75 && "#000000" || "#ffffff"
    };
    sub_color2 = function(color, delta, threshold) {
        var b, g, l, r, ref;
        if (delta == null) {
            delta = .15
        }
        if (threshold == null) {
            threshold = .5
        }
        ref = parse_color_safe(color), r = ref[0], g = ref[1], b = ref[2];
        l = luma(r, g, b);
        if (l < threshold) {
            return hex_color.apply(null, scale_luma(r, g, b, delta))
        } else {
            return hex_color.apply(null, scale_luma(r, g, b, -delta))
        }
    };
    mix_color = function(a, b, amount) {
        var amount_i, b1, b2, g1, g2, r1, r2, ref, ref1;
        if (amount === 1) {
            return a
        }
        if (amount === 0) {
            return b
        }
        ref = parse_color_safe(a), r1 = ref[0], g1 = ref[1], b1 = ref[2];
        ref1 = parse_color_safe(b), r2 = ref1[0], g2 = ref1[1], b2 = ref1[2];
        amount_i = 1 - amount;
        return hex_color(r1 * amount + r2 * amount_i, g1 * amount + g2 * amount_i, b1 * amount + b2 * amount_i)
    };
    I.Color = {
        hsl_to_rgb: hsl_to_rgb,
        rgb_to_hsl: rgb_to_hsl,
        parse_color: parse_color,
        parse_color_safe: parse_color_safe,
        hex_color: hex_color,
        sub_color: sub_color,
        luma: luma,
        rgb_to_yuv: rgb_to_yuv,
        yuv_to_rgb: yuv_to_rgb,
        scale_luma: scale_luma,
        readable_text_color: readable_text_color,
        sub_color2: sub_color2,
        mix_color: mix_color
    }
}).call(this);
(function() {
    I.ContentWarning = function() {
        function ContentWarning(el, opts) {
            this.opts = opts;
            this.el = $(el);
            this.setup_forms()
        }
        ContentWarning.prototype.setup_forms = function() {
            var form;
            form = this.el.find("form");
            return form.remote_submit(function(_this) {
                return function(res) {
                    if (res.errors) {
                        form.set_form_errors(res.errors);
                        return
                    }
                    _this.el.addClass("hidden");
                    setTimeout(function() {
                        return _this.el.remove()
                    }, 300);
                    return form.set_form_errors([])
                }
            }(this))
        };
        return ContentWarning
    }()
}).call(this);
(function() {
    var slice = [].slice;
    I.ConversionTracker = function() {
        function ConversionTracker() {}
        ConversionTracker.types = {
            impression: 1,
            click: 2,
            purchase: 3,
            download: 4,
            join: 5
        };
        ConversionTracker.buffer = [];
        ConversionTracker.find_click = function(suffix) {
            var ca, ev, i, item, len, pattern;
            pattern = new RegExp(":" + suffix + "$");
            ca = this.get_cookie();
            for (i = 0, len = ca.length; i < len; i++) {
                item = ca[i];
                ev = _.isArray(item) ? item[0] : item;
                if (ev.match(pattern)) {
                    return item
                }
            }
        };
        ConversionTracker.strip_click = function(suffix) {
            var ca, ev, item, new_ca, pattern, removed;
            pattern = new RegExp(":" + suffix + "$");
            ca = this.get_cookie();
            removed = 0;
            new_ca = function() {
                var i, len, results;
                results = [];
                for (i = 0, len = ca.length; i < len; i++) {
                    item = ca[i];
                    ev = _.isArray(item) ? item[0] : item;
                    if (ev.match(pattern)) {
                        removed += 1;
                        continue
                    }
                    results.push(item)
                }
                return results
            }();
            if (new_ca.length === ca.length) {
                return 0
            }
            this.write_cookie(new_ca);
            return removed
        };
        ConversionTracker.after_click_action = function(type, suffix) {
            var click, msg, original_msg, split_tests;
            click = this.find_click(suffix);
            if (!click) {
                return
            }
            split_tests = null;
            original_msg = _.isArray(click) ? (split_tests = click[1], click[0]) : click;
            msg = original_msg.replace(/^\d+/, this.types[type]);
            this.strip_click(suffix);
            this.push(msg, split_tests);
            return true
        };
        ConversionTracker.download = function(suffix) {
            return this.after_click_action("download", suffix)
        };
        ConversionTracker.purchase = function(suffix) {
            return this.after_click_action("purchase", suffix)
        };
        ConversionTracker.join = function(suffix) {
            return this.after_click_action("join", suffix)
        };
        ConversionTracker.click = function(suffix) {
            var c, ca, msg, msg_with_split, other_msg, splits;
            msg = this.types.click + ":" + suffix;
            msg_with_split = (splits = this.get_active_splits()) ? [msg, splits] : msg;
            this.push(msg);
            try {
                ca = function() {
                    var i, len, ref, results;
                    ref = this.get_cookie();
                    results = [];
                    for (i = 0, len = ref.length; i < len; i++) {
                        c = ref[i];
                        other_msg = _.isArray(c) ? c[0] : c;
                        if (other_msg === msg) {
                            continue
                        }
                        results.push(c)
                    }
                    return results
                }.call(this);
                ca.push(msg_with_split);
                while (ca.length > 100) {
                    ca.shift()
                }
                this.write_cookie(ca);
                return true
            } catch (error) {}
        };
        ConversionTracker.write_cookie = function(ca) {
            return I.set_cookie("changio_ca", JSON.stringify(ca), {
                expires: 1
            })
        };
        ConversionTracker.get_cookie = function() {
            var ca;
            ca = Cookies.get("changio_ca");
            if (ca) {
                try {
                    return JSON.parse(ca) || []
                } catch (error) {
                    try {
                        return JSON.parse(decodeURIComponent(ca)) || []
                    } catch (error) {
                        return []
                    }
                }
            } else {
                return []
            }
        };
        ConversionTracker.flush_later = function() {
            this.flush_later = _.throttle(this.flush_now, 2e3, {
                leading: false
            });
            $(window).on("beforeunload", function(_this) {
                return function() {
                    _this.flush_now();
                    return void 0
                }
            }(this));
            return this.flush_later()
        };
        ConversionTracker.encode_buffer = function(buffer) {
            var _, ca, i, id, last_obj_type, last_source, last_type, len, obj_id, obj_type, out, p, ref, source, type;
            if (buffer == null) {
                buffer = slice.call(this.buffer)
            }
            buffer.sort();
            out = [];
            last_type = null;
            last_source = null;
            last_obj_type = null;
            for (i = 0, len = buffer.length; i < len; i++) {
                ca = buffer[i];
                ref = ca.match(/^(\d+):(\d+):(\d+):(\d+)$/), _ = ref[0], type = ref[1], source = ref[2], obj_type = ref[3], obj_id = ref[4];
                if (!type) {
                    continue
                }
                if (type !== last_type) {
                    out.push("t" + type);
                    last_type = type
                }
                if (source !== last_source) {
                    out.push("s" + source);
                    last_source = source
                }
                if (obj_type !== last_obj_type) {
                    out.push("o" + obj_type);
                    last_obj_type = obj_type
                }
                id = (+obj_id).toString(36);
                p = String.fromCharCode("A".charCodeAt(0) + id.length);
                out.push("" + p + id)
            }
            return out.join("")
        };
        ConversionTracker.get_active_splits = function() {
            return I.active_splits
        };
        ConversionTracker.flush_url = function(split_tests) {
            var params, splits, x;
            x = this.encode_buffer();
            params = [{
                name: "x",
                value: x
            }];
            if (splits = split_tests || this.get_active_splits()) {
                params.push({
                    name: "s",
                    value: splits.join(",")
                })
            }
            return I.root_url("ca.gif") + "?" + $.param(params)
        };
        ConversionTracker.flush_now_beacon = function(split_tests) {
            var url;
            if (navigator.sendBeacon == null) {
                return this.flush_now(split_tests)
            }
            if (this.buffer.length) {
                if (I.in_dev) {
                    console.debug.apply(console, ["ca(beacon)"].concat(slice.call(_.compact([this.buffer, split_tests]))))
                }
                url = this.flush_url(split_tests);
                if (navigator.sendBeacon(url)) {
                    this.buffer = []
                } else {
                    return this.flush_now()
                }
            }
            return $.when()
        };
        ConversionTracker.flush_now = function(split_tests) {
            var url;
            if (!this.buffer.length) {
                return $.when()
            }
            if (I.in_dev) {
                console.debug.apply(console, ["ca"].concat(slice.call(_.compact([this.buffer, split_tests]))))
            }
            url = this.flush_url(split_tests);
            this.buffer = [];
            return $.Deferred(function(_this) {
                return function(d) {
                    var done, img;
                    img = new Image;
                    img.src = url;
                    done = function() {
                        return d.resolve()
                    };
                    img.onerror = done;
                    return img.onload = done
                }
            }(this))
        };
        ConversionTracker.push = function(msg, split_tests) {
            var v;
            this.buffer = function() {
                var i, len, ref, results;
                ref = this.buffer;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    v = ref[i];
                    if (v !== msg) {
                        results.push(v)
                    }
                }
                return results
            }.call(this);
            this.buffer.push(msg);
            if (this.buffer.length > 50 || split_tests) {
                return this.flush_now(split_tests)
            } else {
                return this.flush_later()
            }
        };
        return ConversionTracker
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments)
            }
        },
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.Countdown = function() {
        Countdown.prototype.max_blocks = 4;

        function Countdown(el, date, opts) {
            this.date = date;
            this.opts = opts != null ? opts : {};
            if (this.opts.max_blocks) {
                this.max_blocks = this.opts.max_blocks
            }
            this.el = $(el);
            this.update_countdown();
            window.setInterval(function(_this) {
                return function() {
                    return _this.update_countdown()
                }
            }(this), 1e3)
        }
        Countdown.prototype.update_countdown = function() {
            var dur, hidable, i, j, label, label_text, len, len1, p, p_el, parts, ref, remaining, results, should_hide, time, tuples, val;
            parts = ["years", "months", "days", "hours", "minutes", "seconds"];
            dur = moment.duration(this.date.diff(moment()));
            hidable = true;
            tuples = function() {
                var i, len, results;
                results = [];
                for (i = 0, len = parts.length; i < len; i++) {
                    p = parts[i];
                    val = dur[p]();
                    if (val === 0 && hidable) {
                        continue
                    }
                    if (val > 0) {
                        hidable = false
                    }
                    results.push([p, val])
                }
                return results
            }();
            tuples = tuples.slice(0, this.max_blocks);
            remaining = {};
            for (i = 0, len = tuples.length; i < len; i++) {
                ref = tuples[i], p = ref[0], time = ref[1];
                remaining[p] = time
            }
            results = [];
            for (j = 0, len1 = parts.length; j < len1; j++) {
                p = parts[j];
                p_el = this.el.find("[data-name='" + p + "']");
                val = remaining[p] || 0;
                should_hide = remaining[p] == null;
                if (!should_hide) {
                    label = p_el.find(".block_label");
                    label_text = label.text();
                    label.text(label_text.replace(/s$/, "") + (val === 1 ? "" : "s"))
                }
                results.push(p_el.toggleClass("hidden", should_hide).find(".block_value").text(val))
            }
            return results
        };
        return Countdown
    }();
    I.TimestampCountdown = function(superClass) {
        extend(TimestampCountdown, superClass);

        function TimestampCountdown() {
            this.update_countdown = bind(this.update_countdown, this);
            return TimestampCountdown.__super__.constructor.apply(this, arguments)
        }
        TimestampCountdown.prototype.update_countdown = function() {
            var dur;
            dur = moment.duration(this.date.diff(moment()));
            return this.el.text(dur.humanize())
        };
        return TimestampCountdown
    }(I.Countdown)
}).call(this);
(function() {
    $.fn.draggable = function(opts) {
        var body, drag_move, drag_start, drag_stop, html, mouse_x, mouse_y, touch_enabled;
        if (opts == null) {
            opts = {}
        }
        touch_enabled = "ontouchstart" in document;
        body = $(document.body);
        html = $("html");
        mouse_x = 0;
        mouse_y = 0;
        drag_stop = function(_this) {
            return function(e) {
                body.removeClass("dragging");
                _this.removeClass("dragging");
                html.off("mousemove touchmove", drag_move);
                return typeof opts.stop === "function" ? opts.stop() : void 0
            }
        }(this);
        drag_move = function(_this) {
            return function(e, _x, _y) {
                var dx, dy;
                dx = _x - mouse_x;
                dy = _y - mouse_y;
                mouse_x += dx;
                mouse_y += dy;
                return typeof opts.move === "function" ? opts.move(dx, dy) : void 0
            }
        }(this);
        drag_start = function(_this) {
            return function(e, _x, _y) {
                if (body.is(".dragging")) {
                    return
                }
                if (typeof opts.skip_drag === "function" ? opts.skip_drag(e) : void 0) {
                    return
                }
                body.addClass("dragging");
                _this.addClass("dragging");
                mouse_x = _x;
                mouse_y = _y;
                if (typeof opts.start === "function") {
                    opts.start()
                }
                return true
            }
        }(this);
        if (touch_enabled) {
            return this.on("touchstart", function(_this) {
                return function(e) {
                    var ref, x, y;
                    ref = e.originalEvent.targetTouches[0], x = ref.pageX, y = ref.pageY;
                    if (drag_start(e, x, y)) {
                        html.one("touchend", drag_stop);
                        drag_move = function(move) {
                            return function(e) {
                                var ref1;
                                ref1 = e.originalEvent.targetTouches[0], x = ref1.pageX, y = ref1.pageY;
                                return move(e, x, y)
                            }
                        }(drag_move);
                        html.on("touchmove", drag_move)
                    }
                    return void 0
                }
            }(this))
        } else {
            return this.on("mousedown", function(_this) {
                return function(e) {
                    if (drag_start(e, e.pageX, e.pageY)) {
                        html.one("mouseup", drag_stop);
                        drag_move = function(move) {
                            return function(e) {
                                return move(e, e.pageX, e.pageY)
                            }
                        }(drag_move);
                        return html.on("mousemove", drag_move)
                    }
                }
            }(this))
        }
    }
}).call(this);
(function() {
    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.FeedbackLightbox = function(superClass) {
        extend(FeedbackLightbox, superClass);

        function FeedbackLightbox() {
            return FeedbackLightbox.__super__.constructor.apply(this, arguments)
        }
        FeedbackLightbox.prototype.init = function() {
            return this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    if (res.errors) {
                        alert(res.errors.join(", "));
                        return
                    }
                    return _this.el.addClass("is_complete")
                }
            }(this))
        };
        return FeedbackLightbox
    }(I.Lightbox);
    I.FeedbackWidget = function() {
        function FeedbackWidget(el) {
            this.el = $(el);
            this.el.on("click", function(_this) {
                return function(e) {
                    var url;
                    url = $(e.target).data("url") + "?" + $.param({
                        url: window.location.href
                    });
                    return I.Lightbox.open_remote(url, I.FeedbackLightbox)
                }
            }(this))
        }
        return FeedbackWidget
    }()
}).call(this);
(function() {
    I.FilterPickers = function() {
        FilterPickers.prototype.label_padding = 10;

        function FilterPickers(el, opts) {
            var all_pickers, hide_all_pickers;
            this.opts = opts != null ? opts : {};
            this.el = $(el);
            all_pickers = this.el.find(".filter_picker_widget");
            if (this.opts.label_padding) {
                this.label_padding = this.opts.label_padding
            }
            hide_all_pickers = function(_this) {
                return function() {
                    return all_pickers.removeClass("open popup_visible").find(".filter_options").css({
                        marginTop: ""
                    })
                }
            }(this);
            $(window).on("click", function(_this) {
                return function(e) {
                    if ($(e.target).closest(".filter_picker_widget").length) {} else {
                        return hide_all_pickers()
                    }
                }
            }(this));
            this.el.on("i:close_filter_pickers", hide_all_pickers);
            this.el.on("click", ".filter_picker_widget .filter_value", function(_this) {
                return function(e) {
                    var height, picker, right_space;
                    e.preventDefault();
                    picker = $(e.currentTarget).closest(".filter_picker_widget");
                    picker.trigger("i:track_link");
                    all_pickers.not(picker).removeClass("open popup_visible");
                    picker.toggleClass("open");
                    height = picker.find(".filter_value").height();
                    picker.find(".filter_options").css({
                        marginTop: height + _this.label_padding * 2,
                        minWidth: picker.width() + 30 + "px"
                    });
                    right_space = $(window).width() - picker.position().left + picker.width();
                    picker.toggleClass("popup_left", right_space < 200);
                    return _.defer(function() {
                        return picker.toggleClass("popup_visible", picker.is(".open"))
                    })
                }
            }(this))
        }
        return FilterPickers
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.GameGridSizer = function() {
        GameGridSizer.prototype.selector = ".game_grid_widget .game_cell .game_thumb";
        GameGridSizer.prototype.width_selector = ".game_grid_widget .game_cell";
        GameGridSizer.prototype.expected_size = 315;
        GameGridSizer.prototype.aspect_ratio = 315 / 250;
        GameGridSizer.prototype.cell_margin = 20;
        GameGridSizer.prototype.no_right_margin = false;
        GameGridSizer.prototype.min_columns = 1;
        GameGridSizer.prototype.double = false;
        GameGridSizer.sizers = {
            el_width: function() {
                var fraction_el, out, r, ref;
                fraction_el = (ref = this.el[0]) != null ? ref.getBoundingClientRect().width : void 0;
                r = fraction_el - Math.floor(fraction_el);
                out = Math.floor(this.el.width());
                if (r > 0) {
                    out -= 1
                }
                return out
            },
            el_rect: function() {
                var ref;
                return Math.floor(((ref = this.el[0]) != null ? ref.getBoundingClientRect().width : void 0) || 0)
            }
        };
        GameGridSizer.initialize = _.once(function() {
            var body, disable_details, enable_details;
            body = $(document.body);
            disable_details = _.debounce(function() {
                return body.addClass("disable_hover")
            }, 200, true);
            enable_details = _.debounce(function() {
                return body.removeClass("disable_hover")
            }, 200);
            return $(window).on("scroll resize", function() {
                disable_details();
                enable_details()
            })
        });

        function GameGridSizer(opts) {
            if (opts == null) {
                opts = {}
            }
            this.available_width = bind(this.available_width, this);
            this.on_size = bind(this.on_size, this);
            $.extend(this, opts);
            this.size_callbacks = [];
            this.constructor.initialize();
            $(window).on("resize", _.debounce(function(_this) {
                return function() {
                    return _this.resize_cells()
                }
            }(this), 200));
            this.resize_cells();
            if (!I.in_test) {
                _.defer(function(_this) {
                    return function() {
                        return _this.resize_cells()
                    }
                }(this))
            }
        }
        GameGridSizer.prototype.on_size = function(fn) {
            return this.size_callbacks.push(fn)
        };
        GameGridSizer.prototype.available_width = function() {
            return $(window).width()
        };
        GameGridSizer.prototype.resize_cells = function(expected_width) {
            var callback, css, i, len, new_height, new_width, num_cells, page_width, real_num_cells, real_width, ref, results;
            if (expected_width == null) {
                expected_width = this.expected_size
            }
            real_width = expected_width + this.cell_margin;
            page_width = this.available_width();
            if (this.no_right_margin) {
                page_width += this.cell_margin
            }
            num_cells = page_width / real_width;
            real_num_cells = Math.ceil(num_cells);
            if (real_num_cells < this.min_columns) {
                real_num_cells = this.min_columns
            }
            new_width = page_width / real_num_cells - this.cell_margin;
            new_height = new_width / this.aspect_ratio;
            new_width = Math.floor(new_width);
            new_height = Math.floor(new_height);
            this.cells_per_row = real_num_cells;
            if (this._style) {
                this._style.remove()
            }
            css = this.selector + " {\n  width: " + new_width + "px;\n  height: " + new_height + "px;\n}";
            if (this.no_right_margin && this.width_selector) {
                css += this.width_selector + ":nth-child(" + real_num_cells + "n) {\n  margin-right: 0;\n}"
            }
            if (this.width_selector) {
                css += this.width_selector + " {\n  width: " + new_width + "px;\n}"
            }
            this._style = $("<style type='text/css'>" + css + "</style>").appendTo($("head"));
            ref = this.size_callbacks;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
                callback = ref[i];
                results.push(callback(this, new_width, new_height))
            }
            return results
        };
        return GameGridSizer
    }();
    I.GameCells = function() {
        function GameCells(el) {
            this.setup_game_tools = bind(this.setup_game_tools, this);
            this.el = $(el);
            this.setup_game_tools();
            this.setup_gifs()
        }
        GameCells.prototype.setup_game_tools = function() {
            return this.el.dispatch("click", {
                add_to_collection_btn: function(_this) {
                    return function(btn) {
                        I.event("grid", I.page_name(), "add_to_collection");
                        if (!I.current_user) {
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.CollectionLightbox)
                    }
                }(this)
            })
        };
        GameCells.prototype.setup_gifs = function() {
            return this.el.on("mouseenter", ".game_cell", function(_this) {
                return function(e) {
                    var el, gif_overlay;
                    el = $(e.currentTarget);
                    if (el.data("grid_hovered")) {
                        return
                    }
                    el.data("grid_hovered", true);
                    gif_overlay = el.find(".gif_overlay");
                    if (!gif_overlay.length) {
                        return
                    }
                    return gif_overlay.css("background-image", "url(" + gif_overlay.data("gif") + ")")
                }
            }(this))
        };
        return GameCells
    }();
    I.GameGrid = function() {
        function GameGrid(el, opts) {
            var copy_fields, field, i, is_css_grid, len, size_opts;
            if (opts == null) {
                opts = {}
            }
            this.refresh_images = bind(this.refresh_images, this);
            this.add_image_loading = bind(this.add_image_loading, this);
            this.setup_conversion_tracking = bind(this.setup_conversion_tracking, this);
            this.el = $(el);
            $.extend(this, opts);
            this.setup_lazy_images();
            if (this.show_popups !== false) {
                new I.GamePopups(this.el)
            }
            new I.GameCells(this.el);
            is_css_grid = this.el.is(".layout_grid");
            if (!this.sizer && this.sizer !== false && !is_css_grid) {
                copy_fields = ["selector", "width_selector", "expected_size", "min_columns", "cell_margin", "available_width"];
                size_opts = {
                    el: this.el,
                    available_width: I.GameGridSizer.sizers.el_width
                };
                for (i = 0, len = copy_fields.length; i < len; i++) {
                    field = copy_fields[i];
                    if (field in opts) {
                        size_opts[field] = opts[field]
                    }
                }
                this.sizer = new I.GameGridSizer(size_opts);
                this.sizer.on_size(function(_this) {
                    return function() {
                        _this.el.trigger("i:grid_resize");
                        return _this.el.lazy_images()
                    }
                }(this))
            }
        }
        GameGrid.prototype.setup_lazy_images = function() {
            return _.defer(function(_this) {
                return function() {
                    return _this.add_image_loading()
                }
            }(this))
        };
        GameGrid.prototype.setup_conversion_tracking = function(source) {
            this.el.on("i:impression", function(_this) {
                return function(e) {
                    var conversion_el, game_id;
                    conversion_el = $(e.target).closest("[data-game_id]");
                    game_id = conversion_el.data("game_id");
                    if (!game_id) {
                        return
                    }
                    return I.ConversionTracker.push("1:" + source + ":1:" + game_id)
                }
            }(this));
            return this.el.on("i:delegate_tracking", function(_this) {
                return function(e, push) {
                    var game_id;
                    game_id = $(e.target).closest("[data-game_id]").data("game_id");
                    if (!game_id) {
                        return
                    }
                    I.ConversionTracker.click(source + ":1:" + game_id);
                    return push(I.ConversionTracker.flush_now())
                }
            }(this))
        };
        GameGrid.prototype.add_image_loading = function() {
            return this.el.lazy_images({
                show_item: function(_this) {
                    return function(item) {
                        item.trigger("i:impression");
                        return item.find(".image_loading").addBack(".image_loading").removeClass("image_loading")
                    }
                }(this)
            })
        };
        GameGrid.prototype.refresh_images = function() {
            var base;
            return typeof(base = this.el.data("lazy_images")) === "function" ? base() : void 0
        };
        return GameGrid
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.Header = function() {
        Header.prototype.track_category = "header";

        function Header(el) {
            this.setup_browse_menu = bind(this.setup_browse_menu, this);
            this.el = $(el);
            I.tracked_links(this.el, this.track_category, "click");
            this.el.on("click", ".menu_tick", function(_this) {
                return function(e) {
                    var body, menu, target;
                    if ($(e.target).closest(".drop_menu").length) {
                        return
                    }
                    target = $(e.currentTarget);
                    menu = target.closest(".drop_menu_wrap").toggleClass("open");
                    body = $(document.body);
                    if (menu.is(".open")) {
                        target.trigger("i:track_link");
                        return body.on("click.drop_menu", function(e) {
                            if ($(e.target).closest(menu).length) {
                                return
                            }
                            menu.removeClass("open");
                            return body.off("click.drop_menu")
                        })
                    } else {
                        return body.off("click.drop_menu")
                    }
                }
            }(this));
            this.setup_browse_menu()
        }
        Header.prototype.setup_browse_menu = function() {
            var browse_button;
            browse_button = this.el.find(".browse_btn");
            this.browse_menu = new I.HoverManager({
                timeout: 750,
                enter_timeout: 100,
                show: function(_this) {
                    return function() {
                        _this.el.addClass("hover_menu_open");
                        browse_button.addClass("open");
                        return setTimeout(function() {
                            return _this.el.addClass("hover_menu_visible")
                        }, 0)
                    }
                }(this),
                hide: function(_this) {
                    return function() {
                        browse_button.removeClass("open");
                        return _this.el.removeClass("hover_menu_visible")
                    }
                }(this),
                after_fade: function(_this) {
                    return function() {
                        return _this.el.removeClass("hover_menu_open")
                    }
                }(this)
            });
            $(document.body).on("click", function(_this) {
                return function(e) {
                    var c;
                    c = $(e.target).closest(".browse_btn, .header_dropdown");
                    if (c.length) {
                        return
                    }
                    _this.browse_menu.hide()
                }
            }(this));
            return this.el.on("mouseenter mouseleave", ".browse_btn, .header_dropdown", function(_this) {
                return function(e) {
                    if (e.type === "mouseenter") {
                        return _this.browse_menu.enter()
                    } else {
                        return _this.browse_menu.leave()
                    }
                }
            }(this))
        };
        return Header
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.HoverManager = function() {
        HoverManager.prototype.default_opts = {
            timeout: 1e3,
            enter_timeout: 150,
            fade_timeout: 400,
            show: function() {},
            hide: function() {},
            after_fade: function() {}
        };

        function HoverManager(opts) {
            this._clear_enter_timeout = bind(this._clear_enter_timeout, this);
            this._clear_fade_timeout = bind(this._clear_fade_timeout, this);
            this._clear_leave_timeout = bind(this._clear_leave_timeout, this);
            this.opts = $.extend({}, this.default_opts, opts);
            this.open = false
        }
        HoverManager.prototype.enter = function() {
            if (this.enter_timeout) {
                return
            }
            this._clear_leave_timeout();
            this._clear_fade_timeout();
            return this.enter_timeout = window.setTimeout(function(_this) {
                return function() {
                    var base;
                    delete _this.enter_timeout;
                    if (!_this.open) {
                        if (typeof(base = _this.opts).show === "function") {
                            base.show()
                        }
                    }
                    return _this.open = true
                }
            }(this), this.opts.enter_timeout)
        };
        HoverManager.prototype.leave = function() {
            if (this.leave_timeout) {
                return
            }
            this._clear_enter_timeout();
            return this.leave_timeout = window.setTimeout(function(_this) {
                return function() {
                    delete _this.leave_timeout;
                    return _this.hide()
                }
            }(this), this.opts.timeout)
        };
        HoverManager.prototype.hide = function() {
            var base;
            this._clear_enter_timeout();
            this._clear_leave_timeout();
            if (this.open) {
                if (typeof(base = this.opts).hide === "function") {
                    base.hide()
                }
            }
            this.open = false;
            this.hiding = true;
            return this.fade_timeout = window.setTimeout(function(_this) {
                return function() {
                    var base1;
                    if (typeof(base1 = _this.opts).after_fade === "function") {
                        base1.after_fade()
                    }
                    return _this.hiding = false
                }
            }(this), this.opts.fade_timeout)
        };
        HoverManager.prototype.show = function() {
            var base;
            return typeof(base = this.opts).show === "function" ? base.show() : void 0
        };
        HoverManager.prototype._clear_leave_timeout = function() {
            if (this.leave_timeout) {
                window.clearTimeout(this.leave_timeout);
                return delete this.leave_timeout
            }
        };
        HoverManager.prototype._clear_fade_timeout = function() {
            if (this.fade_timeout) {
                window.clearTimeout(this.fade_timeout);
                return delete this.fade_timeout
            }
        };
        HoverManager.prototype._clear_enter_timeout = function() {
            if (this.enter_timeout) {
                window.clearTimeout(this.enter_timeout);
                return delete this.enter_timeout
            }
        };
        return HoverManager
    }()
}).call(this);
(function() {
    var DEFAULT_LOCALE, Preloader, current_locale, defer, interpolate, interpolate_react, prefix_req_cache, ref, translations, slice = [].slice,
        hasProp = {}.hasOwnProperty;
    translations = {};
    prefix_req_cache = {};
    DEFAULT_LOCALE = "en";
    current_locale = (ref = window.changio_locale) != null ? ref : DEFAULT_LOCALE;
    defer = window.requestAnimationFrame || _.defer;
    interpolate = function(buffer, parts, variables) {
        var contents, fn, i, len, part, tag_buffer, val;
        for (i = 0, len = parts.length; i < len; i++) {
            part = parts[i];
            if (_.isString(part)) {
                buffer.push(part)
            } else if (part[0] === "v") {
                val = variables[part[1]];
                if (!val) {
                    console.warn("i18n: failed to find value for variable " + part[1])
                }
                buffer.push(val)
            } else if (part[0] === "t") {
                fn = variables[part[1]];
                if (typeof fn !== "function") {
                    throw new Error("i18n: tried to interpolate tag without function: " + part[1])
                }
                contents = part[2];
                tag_buffer = [];
                interpolate(tag_buffer, contents || [], variables);
                buffer.push(fn(tag_buffer.join("")))
            } else {
                throw new Error("i18n: unknown interpolation node: " + JSON.stringify(part))
            }
        }
        return buffer
    };
    interpolate_react = function(parts, variables) {
        var fn, out, part, val;
        if (_.isString(parts)) {
            return parts
        }
        out = function() {
            var i, len, results;
            results = [];
            for (i = 0, len = parts.length; i < len; i++) {
                part = parts[i];
                if (_.isString(part)) {
                    results.push(part)
                } else if (part[0] === "v") {
                    val = variables[part[1]];
                    if (!val) {
                        console.warn("i18n: failed to find value for variable " + part[1])
                    }
                    results.push(val)
                } else if (part[0] === "t") {
                    fn = variables[part[1]];
                    if (typeof fn !== "function") {
                        throw new Error("i18n: tried to interpolate tag without function: " + part[1])
                    }
                    results.push(fn(interpolate_react(part[2], variables)))
                } else {
                    throw new Error("i18n: unknown interpolation node: " + JSON.stringify(part))
                }
            }
            return results
        }();
        if (out.length > 1) {
            return React.createElement.apply(React, [React.Fragment, {}].concat(slice.call(out)))
        } else if (out.length === 0) {
            return null
        } else {
            return out
        }
    };
    Preloader = function() {
        Preloader._cache = {};
        Preloader.for_locale = function(l) {
            var base;
            return (base = this._cache)[l] || (base[l] = new Preloader(l))
        };

        function Preloader(locale1) {
            this.locale = locale1;
            this.last_fetch = null;
            this.next_fetch = null
        }
        Preloader.prototype.fetch = function(prefixes, translations) {
            if (this.next_fetch) {
                this.next_fetch = this.next_fetch.concat(prefixes);
                return this.last_fetch
            } else {
                this.next_fetch = prefixes;
                return this.last_fetch = $.Deferred(function(_this) {
                    return function(d) {
                        return defer(function() {
                            var n, r;
                            if (!window.changio_translations_url) {
                                console.error("missing translations url: changio_translations_url");
                                return
                            }
                            n = _this.next_fetch;
                            r = $.get(window.changio_translations_url, {
                                locale: _this.locale,
                                prefixes: _this.next_fetch.join(",")
                            });
                            _this.next_fetch = null;
                            return r.done(function(res) {
                                var k, v;
                                for (k in res) {
                                    if (!hasProp.call(res, k)) continue;
                                    v = res[k];
                                    if (translations[k]) {
                                        continue
                                    }
                                    translations[k] = v
                                }
                                return d.resolve()
                            })
                        })
                    }
                }(this))
            }
        };
        return Preloader
    }();
    I.i18n = {
        Preloader: Preloader,
        get_translations: function() {
            return translations
        },
        get_cache: function() {
            return prefix_req_cache
        },
        get_locale: function() {
            return current_locale
        },
        insert: function(obj) {
            var k, results, v;
            results = [];
            for (k in obj) {
                if (!hasProp.call(obj, k)) continue;
                v = obj[k];
                if (translations[k]) {
                    continue
                }
                results.push(translations[k] = v)
            }
            return results
        },
        set_locale: function(v) {
            current_locale = v;
            translations = {};
            return prefix_req_cache = {}
        },
        render_string: function(key, obj, variables) {
            var buffer;
            if (_.isString(obj)) {
                if (variables) {
                    console.warn("i18n: provided variables to translation string with no interpolation: " + key)
                }
                return obj
            } else {
                buffer = [];
                if (!variables) {
                    throw new Error("i18n: tried to interpolate " + key + " without variables")
                }
                interpolate(buffer, obj, variables);
                return buffer.join("")
            }
        },
        t: function(key, variables) {
            return I.i18n.fetch_key(key).then(function(_this) {
                return function(obj) {
                    return I.i18n.render_string(key, obj, variables)
                }
            }(this))
        },
        t_sync: function(_this) {
            return function(key, variables) {
                var obj;
                obj = I.i18n.fetch_key_sync(key);
                if (!obj) {
                    throw new Error("i18n: failed to fetch key sync: " + key)
                }
                return I.i18n.render_string(key, obj, variables)
            }
        }(this),
        fetch_key_sync: function(key) {
            if (current_locale === "debug") {
                return "[[" + key + "]]"
            } else {
                return translations[key]
            }
        },
        fetch_key: function(key) {
            var parts, prefix;
            if (current_locale === "debug") {
                return $.when("[[" + key + "]]")
            }
            parts = key.split(".");
            parts.pop();
            if (!parts.length) {
                throw new Error("i18n: empty prefix")
            }
            prefix = parts.join(".");
            return I.i18n.preload(prefix).then(function(_this) {
                return function() {
                    var text;
                    text = translations[key];
                    if (text) {
                        return text
                    }
                    if (current_locale === DEFAULT_LOCALE) {
                        throw new Error("i18n: failed to find key: " + key)
                    }
                    return I.i18n.preload(prefix, DEFAULT_LOCALE).then(function() {
                        text = translations[key];
                        if (!text) {
                            throw new Error("i18n: failed to find key: " + key)
                        }
                        return text
                    })
                }
            }(this))
        },
        preload: function(prefixes, locale) {
            var cache, currently_loading, d, i, len, p, to_fetch;
            if (locale == null) {
                locale = current_locale
            }
            if (locale === "debug") {
                return
            }
            cache = prefix_req_cache;
            if (_.isString(prefixes)) {
                prefixes = [prefixes]
            }
            to_fetch = function() {
                var i, len, results;
                results = [];
                for (i = 0, len = prefixes.length; i < len; i++) {
                    p = prefixes[i];
                    cache[locale] || (cache[locale] = {});
                    if (cache[locale][p]) {
                        continue
                    }
                    results.push(p)
                }
                return results
            }();
            currently_loading = function() {
                var i, len, ref1, results;
                results = [];
                for (i = 0, len = prefixes.length; i < len; i++) {
                    p = prefixes[i];
                    if (((ref1 = cache[locale][p]) != null ? ref1.state() : void 0) === "pending") {
                        results.push(cache[locale][p])
                    }
                }
                return results
            }();
            if (!to_fetch.length) {
                return $.when.apply($, currently_loading)
            }
            d = Preloader.for_locale(locale).fetch(to_fetch, translations);
            for (i = 0, len = to_fetch.length; i < len; i++) {
                p = to_fetch[i];
                if (!cache[locale][p]) {
                    cache[locale][p] = d
                }
            }
            if (currently_loading.length) {
                return $.when.apply($, [d].concat(slice.call(currently_loading)))
            } else {
                return d
            }
        },
        react_class: function(key) {
            return createReactClass({
                displayName: "i18n:" + key,
                getInitialState: function() {
                    var fn;
                    fn = function() {
                        var text;
                        if (text = I.i18n.fetch_key_sync(key)) {
                            return {
                                text: text
                            }
                        } else {
                            return null
                        }
                    };
                    fn.isReactClassApproved = true;
                    return fn
                }(),
                componentWillUnmount: function() {
                    return this.unmounted = true
                },
                componentDidMount: function() {
                    if (!(this.state && this.state.text)) {
                        return I.i18n.fetch_key(key).done(function(_this) {
                            return function(res) {
                                if (_this.unmounted) {
                                    return
                                }
                                return _this.setState({
                                    text: res
                                })
                            }
                        }(this))
                    }
                },
                render: function() {
                    if (this.state) {
                        if (_.isString(this.state.text)) {
                            return this.state.text
                        } else {
                            return interpolate_react(this.state.text, this.props)
                        }
                    } else {
                        return "…"
                    }
                }
            })
        }
    }
}).call(this);
(function() {
    var render_lightbox;
    render_lightbox = function(props) {
        var abbr, code, details, div, h2, p, pre, summary, table, tbody, td, thead, total_queries, total_time, tr;
        table = ReactDOMFactories.table, thead = ReactDOMFactories.thead, tbody = ReactDOMFactories.tbody, tr = ReactDOMFactories.tr, td = ReactDOMFactories.td, abbr = ReactDOMFactories.abbr, details = ReactDOMFactories.details, summary = ReactDOMFactories.summary, div = ReactDOMFactories.div, h2 = ReactDOMFactories.h2, code = ReactDOMFactories.code, pre = ReactDOMFactories.pre, p = ReactDOMFactories.p;
        total_queries = props.query_log.length;
        total_time = props.query_log.reduce(function(v, row) {
            return v + row[1]
        }, 0);
        return R.Lightbox({
            className: "compact perf_query_log_widget",
            style: {
                width: "100%",
                maxWidth: "800px"
            }
        }, h2({}, "Query log"), p({
            style: {
                margin: "0 10px"
            }
        }, "Queries: ", code({}, total_queries), ", Time: ", code({}, (total_time * 1e3).toFixed(2) + "ms")), div({
            style: {
                padding: "10px"
            }
        }, table({
            className: "nice_table",
            style: {
                width: "100%"
            }
        }, thead({}, tr({}, td({}, "Query"), td({}, "Timing"))), tbody({}, props.query_log.map(function(_this) {
            return function(arg, idx) {
                var query, time_ms, time_sec;
                query = arg[0], time_sec = arg[1];
                time_ms = time_sec * 1e3;
                return tr({
                    key: idx
                }, td({}, details({}, summary({}, code({
                    style: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "inline-block",
                        maxWidth: "600px"
                    }
                }, query)), pre({
                    style: {
                        whiteSpace: "pre-wrap"
                    }
                }, query))), td({}, code({
                    style: {
                        fontWeight: time_ms > 10 ? "bold" : void 0,
                        color: time_ms > 100 ? "white" : time_ms > 50 ? "red" : void 0,
                        backgroundColor: time_ms > 100 ? "red" : void 0
                    }
                }, time_ms.toFixed(2) + "ms")))
            }
        }(this))))))
    };
    I.PerfPanel = function() {
        function PerfPanel(data) {
            var tpl;
            data.layout_time || (data.layout_time = 0);
            data.view_time || (data.view_time = 0);
            data.db_time || (data.db_time = 0);
            data.db_count || (data.db_count = 0);
            tpl = _.template('<div class="perf_panel">\n  <div class="stat_row">\n    <strong>Queries:</strong> {{ db_count }}\n  </div>\n\n  <div class="stat_row">\n    <strong>Query time:</strong> {{ Math.floor(db_time * 1000) }}ms\n  </div>\n\n  <div class="stat_row">\n    <strong>View time:</strong> {{ Math.floor((view_time + layout_time) * 1000) }}ms\n  </div>\n\n  <div class="stat_row">\n    <strong>Rest:</strong> {{ Math.floor((total_time - (view_time + layout_time + db_time)) * 1000) }}ms\n  </div>\n\n</div>');
            this.data = data;
            this.el = $(tpl(data)).appendTo(document.body);
            this.el.on("click", function(_this) {
                return function() {
                    return _this.render_queries()
                }
            }(this))
        }
        PerfPanel.prototype.render_queries = function() {
            var query, tbl, time_sec;
            if (!this.data.query_log) {
                return
            }
            tbl = function() {
                var i, len, ref, ref1, results;
                ref = this.data.query_log;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    ref1 = ref[i], query = ref1[0], time_sec = ref1[1];
                    results.push({
                        query: query,
                        time: time_sec * 1e3
                    })
                }
                return results
            }.call(this);
            console.table(tbl);
            return I.add_react().done(function(_this) {
                return function() {
                    if (typeof R !== "undefined" && R !== null ? R.Lightbox : void 0) {
                        return I.Lightbox.open(render_lightbox({
                            query_log: _this.data.query_log
                        }))
                    }
                }
            }(this))
        };
        return PerfPanel
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.GamePopups = function() {
        GamePopups.prototype.trigger_selector = ".game_thumb";
        GamePopups.prototype.popup_selector = ".popup_details";
        GamePopups.prototype.hover_delay = 250;
        GamePopups.prototype.close_timeout = 200;
        GamePopups.prototype.x_offset = 0;

        function GamePopups(el, opts) {
            var body;
            if (opts == null) {
                opts = {}
            }
            this.deferred_for_el = bind(this.deferred_for_el, this);
            if (I.is_mobile()) {
                return
            }
            this.el = $(el);
            $.extend(this, opts);
            body = $(document.body);
            this.el.on("mouseenter mouseleave", this.trigger_selector, function(_this) {
                return function(e) {
                    el = $(e.currentTarget);
                    if (el.closest(".jam_cell").length) {
                        return
                    }
                    if (el.closest(".disable_hover").length) {
                        return
                    }
                    if (e.type === "mouseenter") {
                        return _this.enter(el)
                    } else {
                        return _this.leave(el)
                    }
                }
            }(this));
            body.on("i:hide_popups", function(_this) {
                return function(e, hm) {
                    return _this.close_popup()
                }
            }(this));
            body.on("i:hide_other_popups", function(_this) {
                return function(e, hm) {
                    if (hm === _this) {
                        return
                    }
                    return _this.close_popup()
                }
            }(this))
        }
        GamePopups.prototype.deferred_for_el = function(el) {
            var defer, game_id, popup_url;
            defer = el.data("i:popup_defer");
            if (!defer) {
                game_id = el.closest("[data-game_id]").data("game_id");
                defer = $.Deferred();
                el.data("i:popup_defer", defer);
                if (!game_id) {
                    return
                }
                popup_url = I.subdomain ? "/-/game/popup/" + game_id : "/game/popup/" + game_id;
                $.get(popup_url, function(_this) {
                    return function(popup_html) {
                        var popup;
                        if (_.isObject(popup_html) && popup_html.errors) {
                            return
                        }
                        popup = $(popup_html);
                        popup.data("object_id", game_id);
                        I.tracked_links(popup, "popups", I.page_name(), "click");
                        popup.find("a").on("click", function() {
                            var trigger;
                            if (trigger = popup.data("trigger_el")) {
                                return trigger.trigger("i:track_link")
                            }
                        });
                        return defer.resolve(popup)
                    }
                }(this))
            }
            return defer
        };
        GamePopups.prototype.enter = function(el) {
            var fast, slow;
            el.data("i:inside", true);
            slow = _.debounce(function(_this) {
                return function() {
                    if (!el.data("i:inside")) {
                        return
                    }
                    return _this.deferred_for_el(el).then(function(popup_el) {
                        return _this.show_popup(el, popup_el)
                    })
                }
            }(this), this.hover_delay);
            fast = _.debounce(function(_this) {
                return function() {
                    var start;
                    if (!el.data("i:inside")) {
                        return
                    }
                    start = new Date;
                    return _this.deferred_for_el(el)
                }
            }(this), this.hover_delay / 2);
            return el.on("mousemove.hover_manager", function() {
                slow();
                return fast()
            })
        };
        GamePopups.prototype.leave = function(el) {
            el.data("i:inside", false);
            return el.off("mousemove.hover_manager")
        };
        GamePopups.prototype.show_popup = function(el, popup_el) {
            var base, fn, i, j, len, ref, s, screenshots;
            if (!(typeof(base = document.body).contains === "function" ? base.contains(el[0]) : void 0)) {
                return
            }
            if (this.current_popup === popup_el) {
                return
            }
            this.el.trigger("i:hide_other_popups", [this]);
            if ((ref = this.current_popup) != null) {
                ref.stop().remove()
            }
            this.current_popup = popup_el.css({
                left: "0px",
                top: "0px"
            }).removeClass("visible");
            screenshots = popup_el.find(".popup_screenshot").removeClass("visible");
            $(document.body).append(popup_el);
            this.position_popup(el, popup_el);
            _.defer(function(_this) {
                return function() {
                    return popup_el.addClass("visible")
                }
            }(this));
            popup_el.data("trigger_el", el);
            fn = function(_this) {
                return function(s) {
                    return setTimeout(function() {
                        return s.addClass("visible")
                    }, i * 100)
                }
            }(this);
            for (i = j = 0, len = screenshots.length; j < len; i = ++j) {
                s = screenshots[i];
                fn($(s))
            }
            popup_el.hide().css({
                opacity: ""
            }).fadeIn("fast");
            return this.watch_for_popup_close()
        };
        GamePopups.prototype.watch_for_popup_close = function() {
            var close_timeout, target_selector;
            target_selector = this.trigger_selector + ", " + this.popup_selector;
            close_timeout = null;
            $(document.body).on("click.hover_manager", function(_this) {
                return function(e) {
                    var target;
                    target = $(e.target);
                    if (target.closest(target_selector).length) {
                        return
                    }
                    return _this.close_popup()
                }
            }(this));
            return $(window).on("mousemove.hover_manager", _.throttle(function(_this) {
                return function(e) {
                    var inside;
                    inside = $(e.target).closest(target_selector);
                    if (inside.length) {
                        if (close_timeout) {
                            window.clearTimeout(close_timeout);
                            close_timeout = null
                        }
                        return
                    }
                    if (!close_timeout) {
                        return close_timeout = window.setTimeout(function() {
                            return _this.close_popup()
                        }, _this.close_timeout)
                    }
                }
            }(this), 50))
        };
        GamePopups.prototype.position_popup = function(el, popup) {
            var height, left, offset, target_height, target_width, top, width;
            offset = el.offset();
            width = popup.outerWidth(true);
            height = popup.outerHeight(true);
            popup.removeClass("on_right");
            target_height = el.outerHeight();
            target_width = el.outerWidth();
            top = offset.top + (target_height - height) / 2;
            left = offset.left - width;
            if (left < 0) {
                left = offset.left + target_width;
                left += this.x_offset;
                popup.addClass("on_right")
            } else {
                left -= this.x_offset
            }
            return popup.css({
                top: Math.floor(top) + "px",
                left: Math.floor(left) + "px"
            })
        };
        GamePopups.prototype.close_popup = function() {
            var ref;
            $(window).off("mousemove.hover_manager");
            $(document.body).off("click.hover_manager");
            if ((ref = this.current_popup) != null) {
                ref.stop(true).remove()
            }
            return this.current_popup = null
        };
        return GamePopups
    }();
    I.GamePopup = function() {
        function GamePopup(el) {
            this.el = $(el);
            this.el.dispatch("click", {
                watch_trailer_btn: function(btn) {
                    I.event("grid", I.page_name(), "watch_trailer");
                    return I.Lightbox.open_remote(btn.data("lightbox_url"))
                }
            })
        }
        return GamePopup
    }();
    I.WatchTrailerLightbox = function() {
        function WatchTrailerLightbox(el) {
            this.el = $(el);
            this.el.dispatch("click", {
                add_to_collection_btn: function(_this) {
                    return function(btn) {
                        I.event("grid", "trailer", "add_to_collection");
                        if (!I.current_user) {
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.CollectionLightbox)
                    }
                }(this)
            })
        }
        return WatchTrailerLightbox
    }()
}).call(this);
(function() {
    I.ReferrerTracker = function() {
        function ReferrerTracker() {}
        ReferrerTracker.MAX_ITEMS = 20;
        ReferrerTracker.get_cookie = function() {
            return Cookies.getJSON("changio_refs") || []
        };
        ReferrerTracker.write_cookie = function(val) {
            return I.set_cookie("changio_refs", val, {
                expires: 14
            })
        };
        ReferrerTracker.has_ref = function(type, id) {
            var cid, ctype, i, len, ref, ref1;
            id = +id;
            ref = ReferrerTracker.get_cookie();
            for (i = 0, len = ref.length; i < len; i++) {
                ref1 = ref[i], ctype = ref1[0], cid = ref1[1];
                if (ctype === type && cid === id) {
                    return true
                }
            }
            return false
        };
        ReferrerTracker.push = function(type, id, value) {
            var r, refs;
            if (!(value && value.length > 0)) {
                return
            }
            id = +id;
            refs = function() {
                var i, len, ref, results;
                ref = this.get_cookie();
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    r = ref[i];
                    if (r[0] === type && r[1] === id) {
                        continue
                    }
                    results.push(r)
                }
                return results
            }.call(ReferrerTracker);
            if (I.in_dev) {
                console.log("pushing referrer", [type, id, value])
            }
            refs.unshift([type, id, value]);
            while (refs.length > ReferrerTracker.MAX_ITEMS) {
                refs.pop()
            }
            return ReferrerTracker.write_cookie(refs)
        };
        return ReferrerTracker
    }()
}).call(this);
(function() {
    I.SaleList = function() {
        function SaleList(el) {
            this.el = $(el);
            this.el.lazy_images({})
        }
        return SaleList
    }()
}).call(this);
(function() {
    var UNKNOWN_IMAGE_FORMAT_ERROR, image_type_from_array_buffer, bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments)
            }
        },
        slice = [].slice,
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.prepare_upload = function(prefix, params, fn, fail_fn) {
        return $.ajax({
            url: prefix + "/upload/prepare",
            type: "post",
            data: I.with_csrf(params),
            success: function(_this) {
                return function(res) {
                    if (res.errors) {
                        return typeof fail_fn === "function" ? fail_fn(res.errors.join(",")) : void 0
                    }
                    return typeof fn === "function" ? fn(res) : void 0
                }
            }(this),
            error: function(_this) {
                return function(res) {
                    return typeof fail_fn === "function" ? fail_fn("Server error") : void 0
                }
            }(this)
        })
    };
    image_type_from_array_buffer = function(array_buffer) {
        var dv, hex, nume1, nume2, types;
        dv = new DataView(array_buffer, 0, 5);
        nume1 = dv.getUint8(0, true);
        nume2 = dv.getUint8(1, true);
        hex = nume1.toString(16) + nume2.toString(16);
        types = {
            8950: "image/png",
            4749: "image/gif",
            "424d": "image/bmp",
            ffd8: "image/jpeg"
        };
        return types[hex]
    };
    UNKNOWN_IMAGE_FORMAT_ERROR = "You selected an image type we don't recognize. It's possible it has the wrong file extension for the format it is saved as. Please use an image editing program to convert it to a PNG, JPEG, or GIF.";
    I.test_image_format = function(file) {
        return $.Deferred(function(_this) {
            return function(d) {
                var reader;
                if (window.FileReader) {
                    reader = new FileReader;
                    reader.readAsArrayBuffer(file);
                    reader.onerror = function() {
                        return d.reject("Failed to read image from disk")
                    };
                    return reader.onload = function() {
                        var type;
                        type = image_type_from_array_buffer(reader.result);
                        if (type === "image/bmp") {
                            return d.reject("You selected a BMP file that has a wrong extension. Please use an image editing program to convert it to a PNG, JPEG, or GIF.")
                        } else if (type) {
                            return d.resolve()
                        } else {
                            return d.reject(UNKNOWN_IMAGE_FORMAT_ERROR)
                        }
                    }
                } else {
                    return d.resolve()
                }
            }
        }(this))
    };
    I.image_dimensions = function(file) {
        return $.Deferred(function(d) {
            var image, src;
            src = typeof URL !== "undefined" && URL !== null ? typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : void 0 : void 0;
            if (src) {
                image = new Image;
                image.src = src;
                image.onload = function() {
                    return d.resolve([image.width, image.height])
                };
                return image.onerror = function() {
                    return d.reject(UNKNOWN_IMAGE_FORMAT_ERROR)
                }
            } else {
                return d.reject(UNKNOWN_IMAGE_FORMAT_ERROR)
            }
        })
    };
    I.video_dimensions = function(file) {
        return $.Deferred(function(d) {
            var src, v;
            v = document.createElement("video");
            src = typeof URL !== "undefined" && URL !== null ? typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : void 0 : void 0;
            if (src) {
                v.src = src;
                v.onloadedmetadata = function() {
                    return d.resolve([v.videoWidth, v.videoHeight])
                };
                return v.onerror = function() {
                    return d.reject("Invalid video file")
                }
            } else {
                return d.reject("Invalid video file")
            }
        })
    };
    I.test_image_dimensions = function(file, max_width, max_height) {
        if (max_width == null) {
            max_width = 3840
        }
        if (max_height == null) {
            max_height = 2160
        }
        return I.image_dimensions(file).then(function(_this) {
            return function(size) {
                var height, width;
                width = size[0], height = size[1];
                return $.Deferred(function(d) {
                    if (width > max_width || height > max_height) {
                        return d.reject("Image is greater than the maximum dimensions of " + max_width + "x" + max_height + " (you selected a " + width + "x" + height + " image)")
                    } else {
                        return d.resolve()
                    }
                })
            }
        }(this))
    };
    I.Upload = function() {
        Upload.prototype.error_message = "There was a problem completing your upload. Try again. If the problem persists contact support.";
        Upload.prototype.label = "file";
        Upload.prototype.kind = "upload";

        function Upload(editor1, file1, opts1) {
            this.editor = editor1;
            this.file = file1;
            this.opts = opts1;
            this.start_xhr_upload = bind(this.start_xhr_upload, this);
            this.decrement = bind(this.decrement, this);
            this.increment = bind(this.increment, this);
            this.save_upload = bind(this.save_upload, this)
        }
        Upload.prototype.upload_params = function() {
            return {
                kind: this.kind,
                filename: this.file.name
            }
        };
        Upload.prototype.save_upload = function(success_fn) {
            throw "override `save_upload`"
        };
        Upload.prototype.increment = function() {
            var base, base1;
            (base = this.constructor).active_uploads || (base.active_uploads = 0);
            this.constructor.active_uploads++;
            if (this.constructor.active_uploads === 1) {
                return typeof(base1 = this.opts).start_uploading === "function" ? base1.start_uploading() : void 0
            }
        };
        Upload.prototype.decrement = function() {
            var base;
            this.constructor.active_uploads--;
            if (this.constructor.active_uploads === 0) {
                return typeof(base = this.opts).stop_uploading === "function" ? base.stop_uploading() : void 0
            }
        };
        Upload.prototype.start_xhr_upload = function(fail_handler) {
            var form_data, key, ref, val, xhr;
            if (!this.upload_data) {
                throw "missing upload data"
            }
            this.increment();
            form_data = new FormData;
            ref = this.upload_data.post_params;
            for (key in ref) {
                val = ref[key];
                form_data.append(key, val)
            }
            form_data.append("file", this.file);
            xhr = new XMLHttpRequest;
            xhr.upload.addEventListener("progress", function(_this) {
                return function(e) {
                    if (e.lengthComputable) {
                        return typeof _this.progress === "function" ? _this.progress(e.loaded, e.total) : void 0
                    }
                }
            }(this));
            xhr.upload.addEventListener("error", function(_this) {
                return function(e) {
                    return I.event("upload", "xhr error", _this.kind)
                }
            }(this));
            xhr.upload.addEventListener("abort", function(_this) {
                return function(e) {
                    return I.event("upload", "xhr abort", _this.kind)
                }
            }(this));
            xhr.addEventListener("readystatechange", function(_this) {
                return function(e) {
                    var message;
                    if (xhr.readyState !== 4) {
                        return
                    }
                    _this.decrement();
                    if (Math.floor(xhr.status / 100) === 2) {
                        I.event("upload", "save", _this.kind);
                        return typeof _this.save_upload === "function" ? _this.save_upload(_this.opts.finish_upload) : void 0
                    } else {
                        message = "Failed upload.";
                        if (xhr.responseXML) {
                            try {
                                message = xhr.responseXML.querySelector("Error Message").innerHTML
                            } catch (error1) {
                                e = error1
                            }
                        } else {
                            message = xhr.responseText
                        }
                        I.event("upload_error", "server error " + xhr.status + ": " + message, _this.kind);
                        return fail_handler("error: " + message)
                    }
                }
            }(this));
            xhr.open("POST", this.upload_data.action);
            return xhr.send(form_data)
        };
        Upload.prototype.start_upload = function(fn, fail_fn) {
            var fail_handler;
            if (this.upload_data) {
                return
            }
            fail_handler = function(_this) {
                return function() {
                    if (typeof _this.cancel_upload === "function") {
                        _this.cancel_upload.apply(_this, [_this].concat(slice.call(arguments)))
                    }
                    return typeof fail_fn === "function" ? fail_fn.apply(null, [_this].concat(slice.call(arguments))) : void 0
                }
            }(this);
            return this.editor.prepare_upload(function(_this) {
                return function() {
                    return I.prepare_upload(_this.editor.upload_prefix(), _this.upload_params(), function(upload_data) {
                        _this.upload_data = upload_data;
                        if (typeof _this.have_upload_data === "function") {
                            _this.have_upload_data()
                        }
                        return _this.start_xhr_upload(fail_handler)
                    }, fail_handler)
                }
            }(this), fail_handler)
        };
        return Upload
    }();
    I.ImageUpload = function(superClass) {
        extend(ImageUpload, superClass);

        function ImageUpload() {
            this.save_url = bind(this.save_url, this);
            return ImageUpload.__super__.constructor.apply(this, arguments)
        }
        ImageUpload.prototype.success_params = {};
        ImageUpload.prototype.kind = "image";
        ImageUpload.prototype.label = "image";
        ImageUpload.prototype.save_url = function() {
            return this.editor.upload_prefix() + "/image/success/" + this.upload_data.upload_id
        };
        ImageUpload.prototype.save_upload = function(fn) {
            if (!this.upload_data) {
                return
            }
            return $.ajax({
                url: this.save_url() + "?" + $.param(this.success_params),
                type: "post",
                data: I.with_csrf(),
                success: function(_this) {
                    return function(res) {
                        var type;
                        type = _this.success_params.type || _this.kind;
                        if (res.errors) {
                            I.event("upload_error", type, res.errors.join(", "));
                            if (_this.cancel_upload) {
                                _this.cancel_upload()
                            } else {
                                alert(_this.error_message)
                            }
                            return
                        }
                        return fn.apply(null, [_this].concat(slice.call(arguments)))
                    }
                }(this)
            })
        };
        ImageUpload.delete_image = function(editor, image_id, fn) {
            return $.ajax({
                url: editor.upload_prefix() + "/image/delete/" + image_id,
                type: "post",
                data: I.with_csrf(),
                success: fn
            })
        };
        return ImageUpload
    }(I.Upload);
    I.pick_files = function(opts) {
        var input;
        if (opts == null) {
            opts = {}
        }
        input = opts.input ? $(opts.input) : ($("input.pick_files_input").remove(), $("<input type='file' class='pick_files_input' />").hide().insertAfter("body"));
        return $.Deferred(function(_this) {
            return function(d) {
                if (opts.multiple) {
                    input.attr("multiple", true)
                }
                if (opts.accept) {
                    input.attr("accept", opts.accept)
                }
                input.on("change", function(e) {
                    var deferreds, errors, f, file, files, i, len;
                    files = function() {
                        var i, len, ref, results;
                        ref = e.target.files;
                        results = [];
                        for (i = 0, len = ref.length; i < len; i++) {
                            f = ref[i];
                            results.push(f)
                        }
                        return results
                    }();
                    errors = [];
                    if (typeof opts.on_pick_files === "function") {
                        opts.on_pick_files(files)
                    }
                    for (i = 0, len = files.length; i < len; i++) {
                        file = files[i];
                        if (opts.max_size) {
                            if (file.size > opts.max_size) {
                                errors.push(["You selected an image greater than the max size " + _.str.formatBytes(opts.max_size) + " (you selected a " + _.str.formatBytes(file.size) + " file)", file])
                            }
                        }
                    }
                    if (errors.length) {
                        d.reject(errors, files);
                        return
                    }
                    if (opts.test_file) {
                        deferreds = files.map(function(file) {
                            return $.Deferred(function(fd) {
                                opts.test_file(file, fd);
                                return setTimeout(function() {
                                    if (d.state() === "pending") {
                                        return fd.reject("Timed out checking file, are you sure it was an image file?")
                                    }
                                }, 1e3)
                            }).then(null, function(err) {
                                return [err, file]
                            })
                        });
                        return $.when.apply($, deferreds).done(function(res) {
                            return d.resolve(files)
                        }).fail(function(error) {
                            return d.reject([error])
                        })
                    } else {
                        return d.resolve(files)
                    }
                });
                return input.click()
            }
        }(this))
    };
    I.xhr_upload = function(_this) {
        return function(file, opts) {
            return $.Deferred(function(d) {
                var form_data, key, ref, val, xhr;
                form_data = new FormData;
                ref = opts.post_params;
                for (key in ref) {
                    val = ref[key];
                    form_data.append(key, val)
                }
                form_data.append("file", file);
                xhr = new XMLHttpRequest;
                xhr.upload.addEventListener("progress", function(e) {
                    if (e.lengthComputable) {
                        return d.notify("progress", e.loaded, e.total)
                    }
                });
                xhr.upload.addEventListener("error", function(e) {
                    return d.reject("xhr error")
                });
                xhr.upload.addEventListener("abort", function(e) {
                    return d.reject("xhr aborted")
                });
                xhr.addEventListener("readystatechange", function(e) {
                    var message;
                    if (xhr.readyState !== 4) {
                        return
                    }
                    if (Math.floor(xhr.status / 100) === 2) {
                        return d.resolve()
                    } else {
                        message = "Failed upload.";
                        if (xhr.responseXML) {
                            try {
                                message = xhr.responseXML.querySelector("Error Message").innerHTML
                            } catch (error1) {
                                e = error1
                            }
                        } else {
                            message = xhr.responseText
                        }
                        return d.reject(message)
                    }
                });
                xhr.open("POST", opts.action);
                return xhr.send(form_data)
            })
        }
    }(this);
    I.upload_image = function(opts) {
        if (opts == null) {
            opts = {}
        }
        opts.accept || (opts.accept = "image/png,image/jpeg,image/gif");
        opts.file_params = function(file) {
            if (file.type === "video/mp4") {
                return I.video_dimensions(file).then(function(_this) {
                    return function(arg) {
                        var height, width;
                        width = arg[0], height = arg[1];
                        return {
                            width: width,
                            height: height
                        }
                    }
                }(this))
            } else {
                return I.image_dimensions(file).then(function(_this) {
                    return function(arg) {
                        var height, width;
                        width = arg[0], height = arg[1];
                        return {
                            width: width,
                            height: height
                        }
                    }
                }(this))
            }
        };
        return I.upload_file(opts)
    };
    I.upload_file = function(_this) {
        return function(opts) {
            var accept, max_size, multiple, on_pick_files, on_start_upload, test_file;
            if (opts == null) {
                opts = {}
            }
            if (!opts.url) {
                throw new Error("missing url for upload image")
            }
            accept = opts.accept;
            max_size = opts.max_size, multiple = opts.multiple, on_pick_files = opts.on_pick_files, on_start_upload = opts.on_start_upload, test_file = opts.test_file;
            return I.pick_files({
                accept: accept,
                max_size: max_size,
                multiple: multiple,
                test_file: test_file,
                on_pick_files: on_pick_files
            }).then(function(files) {
                var file, uploads;
                if (!multiple && files.length > 1) {
                    throw "Got multiple files for single upload"
                }
                uploads = function() {
                    var i, len, ref, results;
                    ref = files.slice(0, 6);
                    results = [];
                    for (i = 0, len = ref.length; i < len; i++) {
                        file = ref[i];
                        results.push(function(file) {
                            var more_params;
                            more_params = opts.file_params ? opts.file_params(file) : {};
                            return $.when(more_params).then(function(_this) {
                                return function(p) {
                                    return $.ajax({
                                        url: opts.url,
                                        type: "post",
                                        xhrFields: {
                                            withCredentials: true
                                        },
                                        data: I.with_csrf($.extend({
                                            filename: file.name,
                                            thumb_size: opts.thumb_size,
                                            action: "prepare"
                                        }, p))
                                    }).then(function(res) {
                                        if (res.errors) {
                                            return $.Deferred().reject(res.errors)
                                        }
                                        if (typeof on_start_upload === "function") {
                                            on_start_upload(file, res)
                                        }
                                        return I.xhr_upload(file, res).then(function() {
                                            var savexhr;
                                            savexhr = $.ajax({
                                                url: res.success_url,
                                                type: "post",
                                                xhrFields: {
                                                    withCredentials: true
                                                },
                                                data: I.with_csrf()
                                            });
                                            if (multiple) {
                                                return savexhr.then(function(res) {
                                                    return $.Deferred(function(d) {
                                                        d.notify("upload_saved", res);
                                                        return _.defer(function() {
                                                            return d.resolve(res)
                                                        })
                                                    })
                                                })
                                            } else {
                                                return savexhr
                                            }
                                        })
                                    })
                                }
                            }(this))
                        }(file))
                    }
                    return results
                }();
                if (multiple) {
                    return $.when.apply($, uploads)
                } else {
                    return uploads[0]
                }
            })
        }
    }(this);
    I.make_upload_button = function(editor, btn_elm, upload_cls, opts) {
        var input, max_size;
        if (opts == null) {
            opts = {}
        }
        input = null;
        max_size = btn_elm.data("max_size");
        return btn_elm.on("click", function(_this) {
            return function(e) {
                var accept, type;
                if (input) {
                    input.remove()
                }
                input = $("<input type='file' multiple />").hide().insertAfter(btn_elm);
                if (accept = btn_elm.data("accept")) {
                    input.attr("accept", accept)
                }
                type = upload_cls.prototype.kind;
                I.event("upload", "open", type);
                input.on("change", function() {
                    var file, file_upload, i, len, ref, results;
                    ref = input[0].files;
                    results = [];
                    for (i = 0, len = ref.length; i < len; i++) {
                        file = ref[i];
                        if (max_size != null && file.size > max_size) {
                            I.flash(file.name + " is greater than max size of " + _.str.formatBytes(max_size), "error");
                            continue
                        }
                        file_upload = new upload_cls(editor, file, opts);
                        if (opts.cancel_upload) {
                            file_upload.cancel_upload = opts.cancel_upload
                        }
                        file_upload.start_upload();
                        if (typeof opts.queue_upload === "function") {
                            opts.queue_upload(file_upload)
                        }
                        results.push(I.event("upload", "start", type))
                    }
                    return results
                });
                input.insertAfter(btn_elm);
                return input.click()
            }
        }(this))
    };
    I.make_fake_upload_button = function(editor, btn_elm, upload_cls, opts) {
        if (opts == null) {
            opts = {}
        }
        return btn_elm.on("click", function(e) {
            var uploader;
            uploader = new upload_cls(editor, {
                size: 851520,
                name: "The file that I am uploading.zip",
                type: ".zip"
            }, opts);
            uploader.save_upload = function(fn) {
                uploader.after_save();
                return typeof fn === "function" ? fn(this) : void 0
            };
            uploader.start_upload = function(fn, fail_fn) {
                var more_progress, sent;
                uploader.upload_data = {
                    upload_id: -1
                };
                if (typeof uploader.have_upload_data === "function") {
                    uploader.have_upload_data()
                }
                sent = 0;
                more_progress = function() {
                    sent += Math.floor(Math.random() * 2e4) + 500;
                    if (sent >= uploader.file.size) {
                        return typeof uploader.save_upload === "function" ? uploader.save_upload(opts.finish_upload) : void 0
                    } else {
                        uploader.progress(sent, uploader.file.size);
                        return setTimeout(more_progress, 50)
                    }
                };
                return more_progress()
            };
            if (typeof opts.queue_upload === "function") {
                opts.queue_upload(uploader)
            }
            return uploader.start_upload()
        })
    };
    I.make_popup_upload_button = function(editor, btn, upload_cls, opts) {
        var click_handler, in_progress, update_state;
        if (!editor.upload_prefix) {
            throw "Upload button parent must have `upload_prefix` method"
        }
        in_progress = 0;
        update_state = function(d) {
            in_progress += d;
            if (in_progress === 0) {
                return typeof opts.stop_uploading === "function" ? opts.stop_uploading() : void 0
            } else {
                return typeof opts.start_uploading === "function" ? opts.start_uploading() : void 0
            }
        };
        click_handler = function(e) {
            var lb, ref, ref1, thumb_size, type, upload_url, uploader;
            e.preventDefault();
            type = upload_cls.prototype.kind;
            if (type === "image") {
                type = ((ref = upload_cls.prototype.success_params) != null ? ref.type : void 0) || type
            }
            upload_url = editor.upload_prefix() + ("/upload?type=" + type);
            if (thumb_size = (ref1 = upload_cls.prototype.success_params) != null ? ref1.thumb_size : void 0) {
                upload_url += "&thumb_size=" + thumb_size
            }
            lb = I.Lightbox.open_tpl("upload_lightbox", I.UploadLightbox, upload_url, upload_cls.prototype.label);
            uploader = null;
            I.event("upload", "open", type);
            lb.el.on("i:lightbox_close", function(_this) {
                return function() {
                    return $(document).off("i:upload_popup_msg")
                }
            }(this));
            return $(document).on("i:upload_popup_msg", function(_this) {
                return function(e, msg) {
                    switch (msg.type) {
                        case "save_upload":
                            if (!uploader) {
                                throw "no uploader"
                            }
                            $(document).off("i:upload_popup_msg");
                            I.event("upload", "save", type);
                            update_state(-1);
                            if (typeof opts.finish_upload === "function") {
                                opts.finish_upload(uploader, msg.data)
                            }
                            if (typeof uploader.after_save === "function") {
                                uploader.after_save()
                            }
                            uploader = null;
                            lb.closable = true;
                            return I.Lightbox.close();
                        case "start_upload":
                            if (uploader) {
                                throw "upload already started"
                            }
                            I.event("upload", "start", type);
                            lb.closable = false;
                            lb.el.addClass("not_closable");
                            uploader = new upload_cls(editor, {
                                size: msg.size,
                                name: msg.name
                            }, {});
                            uploader.upload_data = msg.data;
                            if (typeof uploader.have_upload_data === "function") {
                                uploader.have_upload_data()
                            }
                            if (typeof opts.queue_upload === "function") {
                                opts.queue_upload(uploader)
                            }
                            update_state(1);
                            if (typeof uploader.progress === "function") {
                                uploader.progress(1, 1)
                            }
                            uploader.start_upload = function() {};
                            return uploader.save_upload = function() {}
                    }
                }
            }(this))
        };
        return btn.on("click", function(_this) {
            return function(e) {
                if (editor.prepare_upload) {
                    return editor.prepare_upload(function() {
                        return click_handler(e)
                    })
                } else {
                    return click_handler(e)
                }
            }
        }(this))
    };
    I.prepare_download = function(game_slug, upload_id, key, fn, params) {
        if (params == null) {
            params = {}
        }
        if (key) {
            params.key = key
        }
        if (I.proxy_downloads) {
            params.proxy = true
        }
        return $.ajax({
            url: "/" + game_slug + "/file/" + upload_id + "?" + $.param(params),
            type: "post",
            data: I.with_csrf(),
            success: function(_this) {
                return function(res) {
                    var err_msg;
                    if (res.errors) {
                        err_msg = res.errors.join(",");
                        I.event("game_download", "error", err_msg);
                        return alert(err_msg)
                    }
                    return typeof fn === "function" ? fn(res.url, res) : void 0
                }
            }(this)
        })
    };
    I.start_download = function(res) {
        if (!res.url) {
            return
        }
        return _.defer(function(_this) {
            return function() {
                var on_https, open_in_window;
                if (res.external) {
                    window.open(res.url);
                    return
                }
                on_https = window.location.protocol.match("/^https\b");
                open_in_window = on_https && !url.match(/^https\b/);
                if (open_in_window) {
                    return window.location = res.url
                } else if (I.is_ios()) {
                    return window.open(res.url)
                } else {
                    return $('<iframe frameborder="0" style="width: 0; height: 0; visibility: hidden;"></iframe>').attr("src", res.url).appendTo(document.body)
                }
            }
        }(this))
    };
    I.UploadLightbox = function(superClass) {
        extend(UploadLightbox, superClass);

        function UploadLightbox() {
            return UploadLightbox.__super__.constructor.apply(this, arguments)
        }
        UploadLightbox.prototype.init = function(url, label) {
            this.iframe = this.el.find("iframe").attr("src", url);
            if (label) {
                return this.el.find(".label").text(label)
            }
        };
        return UploadLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    I.VideoEmbed = function() {
        function VideoEmbed(el) {
            this.el = $(el);
            this.el.lazy_images({
                selector: ".video_drop",
                show_item: function(_this) {
                    return function(item) {
                        return item.replaceWith(item.data("template"))
                    }
                }(this)
            })
        }
        return VideoEmbed
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments)
            }
        },
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.BuyGameLightbox = function(superClass) {
        extend(BuyGameLightbox, superClass);

        function BuyGameLightbox() {
            this.load_fingerprint = bind(this.load_fingerprint, this);
            return BuyGameLightbox.__super__.constructor.apply(this, arguments)
        }
        BuyGameLightbox.prototype.init = function(game, opts) {
            this.game = game;
            this.buy = new I.BuyForm(this.el, this.game, opts);
            this.buy.event_category = opts.event_category || "view_game";
            this.buy.submit_handler = this.buy.remote_submit;
            this.load_fingerprint(function(_this) {
                return function() {
                    return _this.buy.set_fingerprint()
                }
            }(this));
            this.el.on("i:loading", function(_this) {
                return function(e, is_loading) {
                    return _this.closable = !is_loading
                }
            }(this));
            this.el.on("i:buy_start", function(_this) {
                return function(e, res) {
                    var amount, i, len, name, ref, results, source, value;
                    source = null;
                    amount = null;
                    results = [];
                    for (i = 0, len = res.length; i < len; i++) {
                        ref = res[i], name = ref.name, value = ref.value;
                        switch (name) {
                            case "source":
                                results.push(source = value);
                                break;
                            case "price":
                                results.push(amount = value);
                                break;
                            default:
                                results.push(void 0)
                        }
                    }
                    return results
                }
            }(this));
            return this.el.on("i:buy_complete", function(_this) {
                return function(e) {
                    _this.closable = true;
                    return I.Lightbox.close()
                }
            }(this))
        };
        BuyGameLightbox.prototype.load_fingerprint = function(callback) {
            var html;
            if (window.Fingerprint2) {
                if (typeof callback === "function") {
                    callback()
                }
                return
            }
            html = this.el.data("checkout");
            if (!html) {
                return
            }
            $(document.body).append(html);
            return I.wait_for_object(window, "Fingerprint2", callback)
        };
        return BuyGameLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key]
            }

            function ctor() {
                this.constructor = child
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child
        },
        hasProp = {}.hasOwnProperty;
    I.PickImageLightbox = function(superClass) {
        extend(PickImageLightbox, superClass);

        function PickImageLightbox() {
            return PickImageLightbox.__super__.constructor.apply(this, arguments)
        }
        PickImageLightbox.prototype.init = function(on_image) {
            return this.el.dispatch("click", {
                tab_btn: function(_this) {
                    return function(el) {
                        var tab;
                        tab = el.data("tab");
                        _this.el.find(".tab_content").hide().filter("[data-tab=" + tab + "]").show();
                        return _this.el.find(".tab_btn").removeClass("selected").filter(el).addClass("selected")
                    }
                }(this),
                pick_image_btn: function(_this) {
                    return function(el) {
                        return typeof on_image === "function" ? on_image(el.data("url")) : void 0
                    }
                }(this),
                upload_image_btn: function(_this) {
                    return function(el) {
                        return I.upload_image({
                            url: I.root_url("dashboard/upload-image"),
                            thumb_size: "original"
                        }).progress(function() {
                            if (!el.prop("disabled")) {
                                el.prop("disabled", true).addClass("disabled");
                                el.data("original_text", el.text());
                                return el.text("Uploading...")
                            }
                        }).fail(function() {
                            el.prop("disabled", false).removeClass("disabled");
                            return el.text(el.data("original_text"))
                        }).done(function(res) {
                            var msg, ref;
                            el.prop("disabled", false).removeClass("disabled");
                            el.text(el.data("original_text"));
                            if (res.success) {
                                return typeof on_image === "function" ? on_image(res.upload.thumb_url) : void 0
                            } else {
                                msg = ((ref = res.errors) != null ? ref[0] : void 0) || "Image upload failed";
                                return I.flash(msg, "error")
                            }
                        })
                    }
                }(this)
            })
        };
        return PickImageLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul, slice = [].slice;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Forms");
        types = PropTypes;
        P("FileUploader", {
            propTypes: {
                label: types.string,
                upload: types.shape({
                    id: types.number,
                    url: types.string
                }),
                upload_func: types.func
            },
            getInitialState: function() {
                return {
                    upload: this.props.upload
                }
            },
            componentDidMount: function() {
                return this.dispatch({
                    delete_upload: function(_this) {
                        return function(e) {
                            _this.setState({
                                loading: true
                            });
                            return $.ajax({
                                url: _this.state.upload.url,
                                type: "post",
                                data: I.with_csrf({
                                    action: "delete",
                                    upload_id: _this.state.upload.id
                                })
                            }).done(function(res) {
                                if (res.errors) {
                                    alert(res.errors.join());
                                    return
                                }
                                return _this.setState({
                                    loading: false,
                                    upload: null
                                })
                            })
                        }
                    }(this),
                    pick_file: function(_this) {
                        return function(e) {
                            if (_this.state.uploading || _this.state.loading) {
                                return
                            }
                            return (_this.props.upload_func || I.upload_file)({
                                url: _this.props.upload_url,
                                on_start_upload: function() {
                                    if (!_this.state.uploading) {
                                        return _this.setState({
                                            uploading: true
                                        })
                                    }
                                }
                            }).progress(function(event, sent, total) {
                                console.warn.apply(console, arguments);
                                if (event === "progress") {
                                    return _this.setState({
                                        progress: sent / total
                                    })
                                }
                            }).fail(function() {
                                _this.setState({
                                    uploading: false
                                });
                                return console.error.apply(console, ["upload failed"].concat(slice.call(arguments)))
                            }).done(function(res) {
                                return _this.setState({
                                    uploading: false,
                                    upload: res.upload
                                })
                            })
                        }
                    }(this)
                })
            },
            render_preview_upload: function() {
                if (this.props.render_preview_upload) {
                    return this.props.render_preview_upload()
                } else {
                    return span({
                        className: "upload_filename"
                    }, this.state.upload.filename)
                }
            },
            render: function() {
                var disabled, text;
                text = this.state.uploading ? "Uploading" + (this.state.progress && " (" + Math.floor(this.state.progress * 100) + "%)" || "") : this.state.loading ? "Loading..." : this.props.label ? this.props.label : this.state.upload ? "Replace upload" : "Upload";
                disabled = this.state.uploading || this.state.loading;
                return div({
                    className: "file_uploader"
                }, button({
                    className: classNames("button", {
                        disabled: disabled
                    }),
                    disabled: disabled,
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("pick_file")
                        }
                    }(this)
                }, text), " ", this.state.upload ? input({
                    type: "hidden",
                    name: this.props.name,
                    value: this.state.upload.id
                }) : void 0, this.state.upload && !this.state.loading ? a({
                    href: "#",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("delete_upload")
                        }
                    }(this)
                }, "Remove upload") : void 0, this.state.upload ? this.render_preview_upload() : void 0)
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        types = PropTypes;
        R("FollowButton", {
            propTypes: {
                following: types.bool,
                show_name: types.bool,
                name: types.string,
                login_url: types.string,
                user_id: types.number,
                follow_data: types.object,
                follow_url: types.string.isRequired,
                unfollow_url: types.string.isRequired
            },
            getInitialState: function() {
                return {
                    following: this.props.following
                }
            },
            getDefaultProps: function() {
                return {
                    show_name: true
                }
            },
            componentDidUpdate: function(prev_props, prev_state) {
                if (!prev_state.animate_class && this.state.animate_class) {
                    if (this.timer) {
                        window.clearTimeout(this.timer);
                        delete this.timer
                    }
                    return this.timer = setTimeout(function(_this) {
                        return function() {
                            return _this.setState({
                                animate_class: null
                            })
                        }
                    }(this), 500)
                }
            },
            componentWillUnmount: function() {
                if (this.timer) {
                    window.clearTimeout(this.timer);
                    return delete this.timer
                }
            },
            render: function() {
                var inside;
                inside = this.state.following ? this.state.hovering ? this.props.show_name ? this.tt("misc.follow_button.unfollow_username", {
                    username: this.props.name
                }) : this.tt("misc.follow_button.unfollow") : React.createElement(React.Fragment, {}, span({
                    className: "icon icon-checkmark",
                    "aria-hidden": true,
                    role: "img"
                }), this.props.show_name ? this.tt("misc.follow_button.following_username", {
                    username: this.props.name
                }) : this.tt("misc.follow_button.following")) : React.createElement(React.Fragment, {}, span({
                    className: "icon icon-plus",
                    "aria-hidden": true,
                    role: "img"
                }), this.props.show_name ? this.tt("misc.follow_button.follow_username", {
                    username: this.props.name
                }) : this.tt("misc.follow_button.follow"));
                return this.enclose({
                    component: this.props.login_url ? "a" : "button",
                    href: this.props.login_url,
                    "data-label": "follow_btn",
                    className: classNames("button", {
                        is_following: this.state.following,
                        disabled: this.state.loading
                    }, this.state.animate_class, this.props.className),
                    onMouseEnter: function(_this) {
                        return function() {
                            return _this.setState({
                                hovering: true
                            })
                        }
                    }(this),
                    onMouseLeave: function(_this) {
                        return function() {
                            return _this.setState({
                                hovering: false
                            })
                        }
                    }(this),
                    target: this.props.target,
                    onClick: function(_this) {
                        return function(e) {
                            var btn, url;
                            if (_this.props.login_url) {
                                return
                            }
                            if (_this.state.loading) {
                                return
                            }
                            e.preventDefault();
                            btn = $(e.target);
                            _this.setState({
                                loading: true,
                                animate_class: null
                            });
                            _this.container().trigger("i:track_link");
                            url = _this.state.following ? _this.props.unfollow_url : _this.props.follow_url;
                            return $.post(url, I.with_csrf(_this.props.follow_data), function(res) {
                                if (res.errors) {
                                    I.flash(res.errors.join(", "));
                                    _this.setState({
                                        loading: false
                                    });
                                    return
                                }
                                btn.trigger("i:follow_updated", [{
                                    user_id: _this.props.user_id,
                                    following: res.following,
                                    btn: btn
                                }]);
                                return _this.setState({
                                    following: res.following,
                                    animate_class: res.following ? "animate_bounce" : "animate_drop_down",
                                    loading: false
                                }, function() {
                                    var base;
                                    return typeof(base = _this.props).on_follow_change === "function" ? base.on_follow_change(_this.state.following) : void 0
                                })
                            })
                        }
                    }(this)
                }, inside)
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, c, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul, slice = [].slice;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        if (R.Redactor) {
            return
        }
        c = function(_this) {
            return function() {
                return R.component.apply(R, arguments)
            }
        }(this);
        types = PropTypes;
        c("Redactor", {
            pure: true,
            componentDidMount: function() {
                var opts;
                opts = $.extend({
                    minHeight: 80,
                    source: false
                }, this.props.redactor_opts);
                opts.callbacks || (opts.callbacks = {});
                opts.callbacks.change = function(_this) {
                    return function(html) {
                        var base;
                        if (typeof(base = _this.props).on_change === "function") {
                            base.on_change(html)
                        }
                        if (_this.props.remember_key) {
                            _this.set_memory || (_this.set_memory = _.throttle(function(html) {
                                return I.store_memory(this.remember_key(), html)
                            }, 500));
                            return _this.set_memory(html)
                        }
                    }
                }(this);
                return I.redactor($(ReactDOM.findDOMNode(this)), opts)
            },
            remember_key: function() {
                return "inputmemory:" + this.props.remember_key
            },
            clear_memory: function() {
                return I.clear_memory(this.remember_key())
            },
            get_default_value: function() {
                var v;
                if (v = this.props.defaultValue) {
                    return v
                }
                if (this.props.remember_key) {
                    if (v = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem(this.remember_key()) : void 0) {
                        return v
                    }
                }
            },
            render: function() {
                return textarea({
                    name: this.props.name,
                    value: this.props.value,
                    defaultValue: this.get_default_value(),
                    placeholder: this.props.placeholder,
                    required: this.props.required,
                    autoFocus: this.props.autofocus
                })
            }
        });
        c("CSRF", {
            pure: true,
            render: function() {
                return input({
                    type: "hidden",
                    name: "csrf_token",
                    value: $("meta[name=csrf_token]").attr("value")
                })
            }
        });
        R.DownTickIcon = React.createElement("svg", {
            className: "svgicon icon_down_tick2",
            strokeLinecap: "round",
            stroke: "currentColor",
            role: "img",
            version: "1.1",
            viewBox: "0 0 24 24",
            strokeWidth: "2",
            width: "22",
            height: "22",
            strokeLinejoin: "round",
            "aria-hidden": true,
            fill: "none"
        }, React.createElement("polyline", {
            points: "6 9 12 15 18 9"
        }));
        P = R["package"]("Forms");
        P("TextInputRow", {
            pure: true,
            propTypes: {
                title: types.string,
                sub: types.any,
                name: types.string.isRequired,
                value: types.any
            },
            focus: function() {
                return this.input_ref.current.focus()
            },
            get_input_el: function() {
                return this.input_ref.current
            },
            get_value: function() {
                return this.input_ref.current.value
            },
            componentDidMount: function() {
                var valid_slug_chars;
                if (this.props.money_input) {
                    if (!this.props.currency) {
                        throw new Error("missing currency")
                    }
                    I.money_input(this.input_ref.current, {
                        currency: this.props.currency
                    })
                }
                if (this.props.slug_input) {
                    I.slug_input($(this.input_ref.current))
                }
                if (this.props.integer_input) {
                    valid_slug_chars = /[0-9]/g;
                    return $(this.input_ref.current).on("keypress", function(_this) {
                        return function(e) {
                            var char;
                            if (e.keyCode >= 32) {
                                char = String.fromCharCode(e.keyCode);
                                if (!char.match(valid_slug_chars)) {
                                    return false
                                }
                            }
                        }
                    }(this))
                }
            },
            render: function() {
                var inside;
                inside = [div({
                    className: "label",
                    key: "label"
                }, this.props.title, this.props.sub ? span({
                    className: "sub"
                }, " — ", this.props.sub) : void 0), input({
                    type: "text",
                    key: "input",
                    name: this.props.name,
                    ref: this.input_ref || (this.input_ref = React.createRef()),
                    value: this.props.value,
                    defaultValue: this.props.defaultValue,
                    onChange: this.props.onChange,
                    onKeyUp: this.props.onKeyUp,
                    onFocus: this.props.onFocus,
                    onBlur: this.props.onBlur,
                    onClick: this.props.onClick,
                    readOnly: this.props.readonly,
                    className: classNames({
                        has_error: this.props.has_error
                    }),
                    required: this.props.required,
                    placeholder: this.props.placeholder,
                    disabled: this.props.disabled,
                    pattern: this.props.pattern
                }), this.props.error_message ? p({
                    key: "error",
                    className: "input_error"
                }, this.props.error_message) : void 0];
                if (!this.props.multi) {
                    inside = label({
                        children: inside
                    })
                }
                return div({
                    className: classNames("input_row", this.props.className)
                }, inside)
            }
        });
        P("SimpleSelect", {
            pure: true,
            propTypes: {
                options: types.array.isRequired,
                name: types.string
            },
            getInitialState: function() {
                return {
                    value: this.props.defaultValue ? this.props.defaultValue : void 0
                }
            },
            render: function() {
                var children, current, current_group, push_group, render_current_option;
                current = this.current_option();
                render_current_option = this.props.render_current_option;
                render_current_option || (render_current_option = function(_this) {
                    return function(current) {
                        return current.short_name || current.name
                    }
                }(this));
                children = [];
                current_group = null;
                push_group = function() {
                    if (!current_group) {
                        return
                    }
                    children.push(optgroup.apply(null, [{
                        label: current_group.label,
                        key: "group-" + children.length
                    }].concat(slice.call(current_group.children))));
                    return current_group = null
                };
                this.props.options.map(function(_this) {
                    return function(o, idx) {
                        var opt;
                        opt = option({
                            key: "" + idx,
                            value: o.value
                        }, o.name);
                        if (o.group) {
                            if ((current_group != null ? current_group.label : void 0) !== o.group) {
                                push_group()
                            }
                            current_group || (current_group = {
                                label: o.group,
                                children: []
                            });
                            return current_group.children.push(opt)
                        } else {
                            push_group();
                            return children.push(opt)
                        }
                    }
                }(this));
                push_group();
                return this.enclose({
                    className: classNames({
                        focused: this.state.focused,
                        disabled: this.props.disabled,
                        has_value: current !== this.props.options[0]
                    })
                }, div({
                    className: "selected_option"
                }, span({
                    className: "selected_option_name"
                }, render_current_option(current)), R.DownTickIcon), select({
                    disabled: this.props.disabled,
                    value: current.value,
                    name: this.props.name,
                    onFocus: function(_this) {
                        return function(e) {
                            return _this.setState({
                                focused: true
                            })
                        }
                    }(this),
                    onBlur: function(_this) {
                        return function(e) {
                            return _this.setState({
                                focused: false
                            })
                        }
                    }(this),
                    onChange: this.on_change,
                    children: children
                }))
            },
            on_change: function(e) {
                var value;
                value = e.target.value;
                if (this.props.onChange) {
                    if (value === this.props.value) {
                        return
                    }
                    return this.props.onChange(value)
                } else {
                    if (value === this.state.value) {
                        return
                    }
                    return this.setState({
                        value: value
                    })
                }
            },
            find_option: function(value) {
                var j, len, opt, ref;
                ref = this.props.options;
                for (j = 0, len = ref.length; j < len; j++) {
                    opt = ref[j];
                    if (opt.value === value) {
                        return opt
                    }
                }
            },
            current_option: function() {
                var current, search_value;
                search_value = this.props.value || this.state.value;
                current = search_value != null ? this.find_option(search_value) : void 0;
                return current || this.props.options[0]
            }
        });
        P("Select", {
            propTypes: {
                name: types.string.isRequired,
                value: types.any,
                options: types.array.isRequired
            },
            componentDidMount: function() {
                var el, opts;
                if (!this.props.selectize) {
                    return
                }
                opts = this.props.selectize === true ? {} : this.props.selectize;
                el = $(this.refs.input);
                el.selectize(opts);
                if (this.props.onChange) {
                    return el.on("change", function(_this) {
                        return function(e) {
                            return _this.props.onChange(e)
                        }
                    }(this))
                }
            },
            render: function() {
                return select({
                    ref: "input",
                    name: this.props.name,
                    onChange: this.props.onChange,
                    value: this.props.value,
                    defaultValue: this.props.defaultValue,
                    children: this.props.options.map(function(_this) {
                        return function(arg) {
                            var label, value;
                            value = arg[0], label = arg[1];
                            return option({
                                key: value,
                                value: value
                            }, label || value)
                        }
                    }(this))
                })
            }
        });
        P("RadioButtons", {
            propTypes: {
                name: types.string.isRequired,
                value: types.any,
                options: types.array.isRequired
            },
            getValue: function() {
                var j, len, name, ref, ref1, value;
                ref = this.container().find("input").serializeArray();
                for (j = 0, len = ref.length; j < len; j++) {
                    ref1 = ref[j], name = ref1.name, value = ref1.value;
                    return value
                }
            },
            render: function() {
                return ul({
                    className: "radio_list",
                    children: this.props.options.map(function(_this) {
                        return function(arg, idx) {
                            var input_label, more_opts, sub, value;
                            value = arg[0], input_label = arg[1], sub = arg[2], more_opts = arg[3];
                            return li({
                                key: value != null ? value : idx,
                                className: classNames({
                                    disabled: more_opts != null ? more_opts.disabled : void 0
                                })
                            }, label({}, input($.extend({
                                type: "radio",
                                name: _this.props.name,
                                value: value,
                                defaultChecked: _this.props.defaultValue ? value === _this.props.defaultValue : void 0,
                                checked: _this.props.value != null ? value === _this.props.value : void 0,
                                onChange: _this.props.onChange
                            }, more_opts)), span({
                                className: "radio_label"
                            }, input_label), sub ? span({
                                className: "sub"
                            }, " — ", sub) : void 0))
                        }
                    }(this))
                })
            }
        });
        P("Slider", {
            pure: true,
            propTypes: {
                min: types.number,
                max: types.number,
                value: types.number,
                onChange: types.func,
                disabled: types.bool
            },
            getInitialState: function() {
                return {}
            },
            on_change: function(value) {
                value = Math.round(value);
                if (this.props.onChange) {
                    if (this.props.value === value) {
                        return
                    }
                    return this.props.onChange(value)
                } else {
                    if (this.state.value === value) {
                        return
                    }
                    return this.setState({
                        value: value
                    })
                }
            },
            start_drag: function(start_x, start_y) {
                var move_listener, start_value, up_listener, width;
                if (this.props.disabled) {
                    return
                }
                width = this.refs.track.clientWidth;
                start_value = this.current_value();
                this.setState({
                    dragging: true
                });
                move_listener = function(_this) {
                    return function(e) {
                        var dx, new_value, x, y;
                        e.preventDefault();
                        if (e.buttons === 0) {
                            up_listener();
                            return
                        }
                        x = e.pageX;
                        y = e.pageX;
                        dx = x - start_x;
                        new_value = dx / width * (_this.props.max - _this.props.min) + start_value;
                        new_value = Math.min(_this.props.max, Math.max(_this.props.min, new_value));
                        if (new_value !== _this.current_value()) {
                            return _this.on_change(new_value)
                        }
                    }
                }(this);
                up_listener = function(_this) {
                    return function(e) {
                        if (e != null) {
                            e.preventDefault()
                        }
                        _this.setState({
                            dragging: false
                        });
                        document.body.removeEventListener("mousemove", move_listener);
                        document.body.removeEventListener("mouseup", up_listener);
                        return delete _this.up_listener
                    }
                }(this);
                document.body.addEventListener("mousemove", move_listener);
                document.body.addEventListener("mouseup", up_listener);
                return this.up_listener = up_listener
            },
            current_value: function() {
                if ("value" in this.state) {
                    return this.state.value || this.props.min
                } else {
                    return this.props.value || this.props.min
                }
            },
            percent: function() {
                return (this.current_value() - this.props.min) / (this.props.max - this.props.min)
            },
            componentWillUnmount: function() {
                if (this.up_listener) {
                    return this.up_listener()
                }
            },
            render: function() {
                var offset_style;
                offset_style = {
                    left: this.percent() * 100 + "%"
                };
                return this.enclose({
                    className: classNames("slider_input", {
                        disabled: this.props.disabled
                    }),
                    onClick: function(_this) {
                        return function(e) {
                            var new_value, rect;
                            if (e.target === _this.refs.slider_nub) {
                                return
                            }
                            rect = _this.refs.track.getBoundingClientRect();
                            p = Math.min(rect.width, Math.max(0, e.pageX - rect.left)) / rect.width;
                            new_value = _this.props.min + p * (_this.props.max - _this.props.min);
                            new_value = Math.min(_this.props.max, Math.max(_this.props.min, new_value));
                            if (new_value !== _this.current_value()) {
                                return _this.on_change(new_value)
                            }
                        }
                    }(this)
                }, this.props.name ? input({
                    type: "hidden",
                    name: this.props.name,
                    value: this.current_value()
                }) : void 0, div({
                    ref: "track",
                    className: "slider_track"
                }, div({
                    className: "slider_fill",
                    style: {
                        width: this.percent() * 100 + "%"
                    }
                }), this.state.focused && this.props.show_tooltip ? div({
                    style: offset_style,
                    className: "value_tooltip"
                }, this.current_value()) : void 0, button({
                    type: "button",
                    ref: "slider_nub",
                    className: "slider_nub",
                    onFocus: function(_this) {
                        return function() {
                            return _this.setState({
                                focused: true
                            })
                        }
                    }(this),
                    onBlur: function(_this) {
                        return function() {
                            return _this.setState({
                                focused: false
                            })
                        }
                    }(this),
                    onMouseDown: function(_this) {
                        return function(e) {
                            return _this.start_drag(e.pageX, e.pageY)
                        }
                    }(this),
                    onKeyDown: function(_this) {
                        return function(e) {
                            switch (e.keyCode) {
                                case 37:
                                    _this.on_change(Math.max(_this.props.min, _this.current_value() - 1));
                                    break;
                                case 39:
                                    _this.on_change(Math.min(_this.props.max, _this.current_value() + 1));
                                    break;
                                default:
                                    return
                            }
                            return e.preventDefault()
                        }
                    }(this),
                    style: offset_style
                })))
            }
        });
        P("FilterPicker", {
            pure: true,
            componentWillUnmount: function() {
                return $(window).off("click", this.window_click_listener)
            },
            getDefaultProps: function() {
                return {
                    label_padding: 3
                }
            },
            getInitialState: function() {
                return {
                    open: false
                }
            },
            close_picker: function() {
                if (!this.state.open) {
                    return
                }
                this.setState({
                    open: false,
                    popup_visible: false
                });
                return $(window).off("click", this.window_click_listener)
            },
            open_picker: function() {
                var el, rect;
                el = this.open_button_ref.current;
                rect = el.getBoundingClientRect();
                if (this.window_click_listener) {
                    $(window).off("click", this.window_click_listener)
                }
                this.window_click_listener = function(_this) {
                    return function(e) {
                        c = $(e.target).closest(_this.container());
                        if (c.length) {
                            return
                        }
                        return _this.close_picker()
                    }
                }(this);
                $(window).on("click", this.window_click_listener);
                return this.setState({
                    open: true,
                    top: -this.props.label_padding,
                    left: -this.props.label_padding,
                    height: rect.height + this.props.label_padding * 2
                }, function(_this) {
                    return function() {
                        _this.filter_popup_ref.current.focus();
                        return _.defer(function() {
                            if (_this.window_click_listener && _this.state.open) {
                                return _this.setState({
                                    popup_visible: true
                                })
                            }
                        })
                    }
                }(this))
            },
            render: function() {
                return this.enclose({
                    className: classNames("filter_picker_widget", {
                        open: this.state.open,
                        popup_visible: this.state.popup_visible
                    }),
                    onKeyDown: this.state.open ? function(_this) {
                        return function(e) {
                            if (e.keyCode === 27) {
                                return _this.close_picker()
                            }
                        }
                    }(this) : void 0
                }, button({
                    type: "button",
                    className: "filter_value",
                    ref: this.open_button_ref || (this.open_button_ref = React.createRef()),
                    onClick: this.state.open ? this.close_picker : this.open_picker
                }, span({
                    className: "value_label"
                }, this.props.label), R.DownTickIcon), div({
                    tabIndex: -1,
                    ref: this.filter_popup_ref || (this.filter_popup_ref = React.createRef()),
                    className: "filter_popup",
                    style: {
                        top: (this.state.top || 0) + "px",
                        left: (this.state.left || 0) + "px"
                    }
                }, div({
                    style: {
                        marginTop: (this.state.height || 0) + "px"
                    },
                    className: "filter_options"
                }, this.props.render_children ? this.state.open ? this.props.render_children() : void 0 : this.props.children)))
            }
        });
        P("StarPicker", {
            pure: true,
            getDefaultProps: function() {
                return {
                    total_stars: 5,
                    star_filled: "icon-star",
                    star_empty: "icon-star2"
                }
            },
            getInitialState: function() {
                return {}
            },
            set_value: function(value) {
                var base;
                if (this.props.set_value) {
                    this.props.set_value(value)
                } else {
                    this.setState({
                        value: value
                    })
                }
                return typeof(base = this.props).on_change === "function" ? base.on_change(value) : void 0
            },
            render: function() {
                var display_value, i, ref, ref1, ref2, stars, value;
                value = (ref = (ref1 = (ref2 = this.props.value) != null ? ref2 : this.state.value) != null ? ref1 : this.props.defaultValue) != null ? ref : 0;
                display_value = this.state.preview_value || value;
                stars = function() {
                    var j, ref3, results;
                    results = [];
                    for (i = j = 1, ref3 = this.props.total_stars; 1 <= ref3 ? j <= ref3 : j >= ref3; i = 1 <= ref3 ? ++j : --j) {
                        results.push(function(_this) {
                            return function(i) {
                                var cls, selected, title;
                                cls = i > display_value ? "star icon " + _this.props.star_empty : "star icon " + _this.props.star_filled;
                                selected = value === i;
                                title = i + " Star" + (i === 1 ? "" : "s");
                                return button({
                                    key: "star-" + i,
                                    type: "button",
                                    title: title,
                                    role: "radio",
                                    "aria-describedby": _this.props["aria-describedby"],
                                    "aria-label": title,
                                    "aria-checked": selected ? "true" : "false",
                                    onMouseEnter: function() {
                                        return _this.setState({
                                            preview_value: i
                                        })
                                    },
                                    onMouseLeave: function() {
                                        return _this.setState({
                                            preview_value: null
                                        })
                                    },
                                    onClick: function() {
                                        return _this.set_value(i)
                                    }
                                }, span({
                                    className: cls
                                }))
                            }
                        }(this)(i))
                    }
                    return results
                }.call(this);
                return this.enclose({
                    "aria-labelledby": this.props["aria-labelledby"],
                    role: "radiogroup",
                    className: classNames(this.props.className, {
                        interactive: true,
                        previewing: this.state.preview_value != null,
                        has_value: value > 0
                    })
                }, this.props.name ? input({
                    type: "hidden",
                    name: this.props.name,
                    value: value > 0 ? value : ""
                }) : void 0, stars)
            }
        });
        P("EditableInput", {
            getInitialState: function() {
                return {
                    value: null,
                    edit_value: null
                }
            },
            componentDidUpdate: function(prev_props) {
                var value;
                value = this.state.value ? this.state.value : this.props.value;
                if (this.props.value === value) {
                    return
                }
                return this.setState({
                    value: this.props.value,
                    edit_value: null
                })
            },
            confirm_edit: function() {
                if (!this.state.edit_value) {
                    return
                }
                return this.setValue(this.state.edit_value)
            },
            cancel_edit: function() {
                return this.setState({
                    edit_value: null
                })
            },
            setValue: function(value) {
                var base;
                this.setState({
                    value: value,
                    edit_value: null
                });
                return typeof(base = this.props).onUpdate === "function" ? base.onUpdate(value) : void 0
            },
            render: function() {
                var ref;
                return input({
                    type: (ref = this.props.type) != null ? ref : "text",
                    className: this.props.className,
                    name: this.props.name,
                    title: this.props.title,
                    readOnly: this.props.readonly,
                    required: this.props.required,
                    placeholder: this.props.placeholder,
                    disabled: this.props.disabled,
                    pattern: this.props.pattern,
                    value: this.state.edit_value !== null ? this.state.edit_value : this.state.value !== null ? this.state.value : this.props.value,
                    onKeyDown: function(_this) {
                        return function(e) {
                            if (e.keyCode === 27) {
                                _this.cancel_edit();
                                e.stopPropagation()
                            }
                            if (e.keyCode === 13) {
                                _this.confirm_edit();
                                return e.stopPropagation()
                            }
                        }
                    }(this),
                    onFocus: function(_this) {
                        return function(e) {
                            return e.target.select()
                        }
                    }(this),
                    onBlur: function(_this) {
                        return function(e) {
                            return _this.confirm_edit()
                        }
                    }(this),
                    onChange: function(_this) {
                        return function(e) {
                            return _this.setState({
                                edit_value: e.target.value
                            })
                        }
                    }(this)
                })
            }
        });
        P("FocusButton", {
            pure: true,
            getInitialState: function() {
                return {
                    focused: false
                }
            },
            componentWillUnmount: function() {
                var base;
                if (this.state.focused) {
                    return typeof(base = this.props).on_decrement_focus === "function" ? base.on_decrement_focus() : void 0
                }
            },
            on_focus: function() {
                var base;
                this.setState({
                    focused: true
                });
                return typeof(base = this.props).on_increment_focus === "function" ? base.on_increment_focus() : void 0
            },
            on_blur: function() {
                var base;
                this.setState({
                    focused: false
                });
                return typeof(base = this.props).on_decrement_focus === "function" ? base.on_decrement_focus() : void 0
            },
            render: function() {
                var props;
                props = $.extend({
                    onFocus: this.on_focus,
                    onBlur: this.on_blur
                }, this.props);
                delete props.on_increment_focus;
                delete props.on_decrement_focus;
                return button(props)
            }
        });
        P("FormErrors", {
            pure: true,
            getDefaultProps: function() {
                return {
                    animated: true,
                    scroll_into_view: true
                }
            },
            propTypes: {
                title: types.string,
                errors: types.array.isRequired
            },
            render: function() {
                var el;
                el = function() {
                    if (this.props.animated) {
                        if (!R.SlideDown) {
                            throw new Error("Attempted to render animated errors without R.SlideDown")
                        }
                        return R.SlideDown
                    } else {
                        return section
                    }
                }.call(this);
                return el({
                    className: classNames(this.enclosing_class_name(), "form_errors"),
                    role: "alert"
                }, div({
                    ref: this.props.scroll_into_view ? function(el) {
                        if (el) {
                            return typeof el.scrollIntoView === "function" ? el.scrollIntoView() : void 0
                        }
                    } : void 0
                }, p({}, strong({}, this.props.title || this.tt("misc.forms.form_errors"))), ul({}, this.props.errors.map(function(_this) {
                    return function(e) {
                        var text;
                        text = e === "recaptcha" ? "Please complete the CAPTCHA to continue" : e;
                        return li({
                            key: e
                        }, text)
                    }
                }(this))), this.props.children))
            }
        });
        P("RecaptchaInput", {
            propTypes: {
                sitekey: types.string.isRequired
            },
            componentDidMount: function() {
                return I.with_recaptcha(function(_this) {
                    return function() {
                        var el;
                        I.event("recaptcha", "show", I.page_name());
                        el = ReactDOM.findDOMNode(_this);
                        return grecaptcha.render(el, {
                            sitekey: _this.props.sitekey
                        })
                    }
                }(this))
            },
            render: function() {
                return div({
                    className: "g-recaptcha"
                })
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, ref, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        if ((ref = R.Forms) != null ? ref.ColorWheel : void 0) {
            return
        }
        P = R["package"]("Forms");
        types = PropTypes;
        P("PortalElement", {
            getInitialState: function() {
                this.el = document.createElement("div");
                $(this.el).addClass("portal_element");
                return {}
            },
            componentDidMount: function() {
                return this.props.container_el.appendChild(this.el)
            },
            componentWillUnmount: function() {
                return this.props.container_el.removeChild(this.el)
            },
            render: function() {
                return ReactDOM.createPortal(this.props.children, this.el)
            }
        });
        P("ColorWheel", {
            render: function() {
                var h, l, rad, ref1, ref2, ref3, s, x, y;
                if (((ref1 = this.state) != null ? ref1.color : void 0) && !this.props.onChange) {
                    ref2 = this.state.color, h = ref2[0], s = ref2[1], l = ref2[2]
                } else if (this.props.color) {
                    ref3 = this.props.color, h = ref3[0], s = ref3[1], l = ref3[2]
                }
                if (h == null) {
                    h = 0
                }
                if (s == null) {
                    s = 50
                }
                if (l == null) {
                    l = 100
                }
                rad = (h - 90) / 180 * Math.PI;
                x = Math.cos(rad);
                y = Math.sin(rad);
                return this.enclose({}, div({
                    className: "color_block",
                    style: {
                        background: "hsl(" + h + ", 100%, 50%)",
                        width: "101px",
                        height: "101px"
                    }
                }), div({
                    className: "wheel",
                    style: {
                        width: "195px",
                        height: "195px"
                    },
                    onMouseDown: function(_this) {
                        return function(event) {
                            event.preventDefault();
                            return _this.start_drag(event, event.target, function(px, py) {
                                var deg, new_h;
                                x = (px - .5) * 2;
                                y = (py - .5) * 2;
                                deg = Math.atan2(y, x) / Math.PI * 180;
                                new_h = (deg + 360 + 90) % 360;
                                return _this.update_color(new_h, s, l)
                            })
                        }
                    }(this)
                }), div({
                    className: "mask",
                    style: {
                        width: "101px",
                        height: "101px"
                    },
                    onMouseDown: function(_this) {
                        return function(event) {
                            event.preventDefault();
                            return _this.start_drag(event, event.target, function(px, py) {
                                var new_l, new_s;
                                new_s = (1 - px) * 100;
                                new_l = (1 - py) * 100;
                                return _this.update_color(h, new_s, new_l)
                            })
                        }
                    }(this)
                }), div({
                    className: "marker h-marker",
                    style: {
                        left: 97 + x * 84 + "px",
                        top: 97 + y * 84 + "px"
                    }
                }), div({
                    className: "marker sl-marker",
                    style: {
                        left: 47 + 101 * (100 - s) / 100 + "px",
                        top: 47 + 101 * (100 - l) / 100 + "px"
                    }
                }))
            },
            set_hex_color: function(color) {
                var b, g, r, ref1;
                try {
                    ref1 = I.Color.parse_color(color), r = ref1[0], g = ref1[1], b = ref1[2];
                    return this.setState({
                        color: I.Color.rgb_to_hsl(r, g, b)
                    })
                } catch (error) {}
            },
            update_color: function(h, s, l) {
                if (this.props.onChange != null) {
                    return this.props.onChange([h, s, l])
                } else {
                    return this.setState({
                        color: [h, s, l]
                    })
                }
            },
            start_drag: function(original_event, el, callback) {
                var move_listener, ref1, up_listener;
                if ((ref1 = this.state) != null ? ref1.dragging : void 0) {
                    return
                }
                this.setState({
                    dragging: true
                });
                move_listener = function(e) {
                    var px, py, rect, x, y;
                    e.preventDefault();
                    if (e.buttons === 0) {
                        up_listener();
                        return
                    }
                    rect = el.getBoundingClientRect();
                    x = e.clientX;
                    y = e.clientY;
                    px = (x - rect.left) / (rect.right - rect.left);
                    py = (y - rect.top) / (rect.bottom - rect.top);
                    px = Math.min(1, Math.max(0, px));
                    py = Math.min(1, Math.max(0, py));
                    return typeof callback === "function" ? callback(px, py) : void 0
                };
                up_listener = function(_this) {
                    return function(e) {
                        if (e != null) {
                            e.preventDefault()
                        }
                        document.body.removeEventListener("mousemove", move_listener);
                        document.body.removeEventListener("mouseup", up_listener);
                        delete _this.up_listener;
                        return _this.setState({
                            dragging: false
                        })
                    }
                }(this);
                document.body.addEventListener("mousemove", move_listener);
                document.body.addEventListener("mouseup", up_listener);
                move_listener(original_event);
                return this.up_listener = up_listener
            }
        });
        P("ColorInputPopup", {
            palette: ["#193d3f", "#3f2832", "#743f39", "#9e2835", "#b86f50", "#327345", "#e53b44", "#4f6781", "#0484d1", "#fb922b", "#afbfd2", "#63c64d", "#e4a672", "#2ce8f4", "#ffe762"],
            set_wheel_color: function(color) {
                var b, g, r, ref1;
                try {
                    ref1 = I.Color.parse_color(color), r = ref1[0], g = ref1[1], b = ref1[2];
                    return this.setState({
                        wheel_color: I.Color.rgb_to_hsl(r, g, b)
                    })
                } catch (error) {}
            },
            componentDidMount: function() {
                var ref1;
                if (!((ref1 = this.state) != null ? ref1.wheel_color : void 0) && this.props.color) {
                    return this.set_wheel_color(this.props.color)
                }
            },
            render: function() {
                var palette, pos, ref1, style;
                this.wheel_ref || (this.wheel_ref = React.createRef());
                palette = this.props.palette || this.palette;
                if (pos = this.props.position) {
                    style = {
                        left: pos.left + "px",
                        top: pos.top + "px"
                    }
                }
                return this.enclose({
                    className: "color_popout",
                    style: style
                }, this.props.allow_empty && this.props.color ? button({
                    type: "button",
                    className: "clear_color_btn",
                    onClick: function(_this) {
                        return function() {
                            var base;
                            return typeof(base = _this.props).set_color === "function" ? base.set_color("") : void 0
                        }
                    }(this)
                }, "Clear") : void 0, R.Forms.ColorWheel({
                    ref: this.wheel_ref,
                    color: (ref1 = this.state) != null ? ref1.wheel_color : void 0,
                    onChange: function(_this) {
                        return function(color) {
                            var base, ref2, ref3;
                            if (typeof(base = _this.props).set_color === "function") {
                                base.set_color((ref3 = I.Color).hex_color.apply(ref3, (ref2 = I.Color).hsl_to_rgb.apply(ref2, color)))
                            }
                            return _this.setState({
                                wheel_color: color
                            })
                        }
                    }(this)
                }), palette ? div({
                    className: "palette_options"
                }, palette.map(function(_this) {
                    return function(color) {
                        return button({
                            key: color,
                            type: "button",
                            style: {
                                backgroundColor: color
                            },
                            onClick: function(e) {
                                var base;
                                if (typeof(base = _this.props).set_color === "function") {
                                    base.set_color(color)
                                }
                                return _this.set_wheel_color(color)
                            }
                        }, color)
                    }
                }(this))) : void 0)
            }
        });
        P("ColorInput", {
            pure: true,
            propTypes: {
                name: types.string,
                value: types.any,
                defaultValue: types.any,
                allow_empty: types.bool,
                popout_portal_target: types.object
            },
            componentDidMount: function() {
                var base;
                (base = R.Forms.ColorInput).active_inputs || (base.active_inputs = []);
                return R.Forms.ColorInput.active_inputs.push(this)
            },
            componentWillUnmount: function() {
                var c;
                return R.Forms.ColorInput.active_inputs = function() {
                    var i, len, ref1, results;
                    ref1 = R.Forms.ColorInput.active_inputs;
                    results = [];
                    for (i = 0, len = ref1.length; i < len; i++) {
                        c = ref1[i];
                        if (c !== this) {
                            results.push(c)
                        }
                    }
                    return results
                }.call(this)
            },
            componentDidUpdate: function(prev_props, prev_state) {
                var c, current_value, new_value;
                current_value = prev_props.value || "";
                new_value = this.props.value || "";
                if (current_value !== new_value) {
                    if (c = this.set_color(new_value)) {
                        return this.refs.input.value = c
                    }
                }
            },
            getInitialState: function() {
                return {
                    open: false,
                    last_value: this.props.value || this.props.defaultValue || ""
                }
            },
            on_blur: function() {
                if (!this.set_color_from_input()) {
                    this.input_ref.current.value = this.state.last_value;
                    return this.set_color(this.state.last_value)
                }
            },
            set_color_from_input: function() {
                var c, input_value, ref1;
                input_value = this.input_ref.current.value;
                if (input_value === "" && this.props.allow_empty) {
                    this.setState({
                        has_error: false,
                        last_value: ""
                    });
                    return true
                }
                if (input_value !== "" && !input_value.match("^#")) {
                    input_value = "#" + input_value;
                    this.input_ref.current.value = input_value
                }
                c = I.Color.parse_color(input_value);
                if (c) {
                    this.set_color(input_value);
                    if ((ref1 = this.popout_ref.current) != null) {
                        ref1.set_wheel_color(input_value)
                    }
                    return true
                } else {
                    this.setState({
                        has_error: true
                    });
                    return false
                }
            },
            set_color: function(color) {
                var base;
                this.input_ref.current.value = color;
                this.setState({
                    last_value: color,
                    has_error: false
                });
                return typeof(base = this.props).onChange === "function" ? base.onChange(color) : void 0
            },
            open: function() {
                if (this.state.open) {
                    return
                }
                this.setState({
                    open: true,
                    on_left: this.popout_on_left(),
                    popout_position: this.popout_position()
                });
                this.click_outside_handler || (this.click_outside_handler = function(_this) {
                    return function(e) {
                        var el, popout, self;
                        self = ReactDOM.findDOMNode(_this);
                        if ($(e.target).closest(self).length) {
                            return
                        }
                        if (popout = _this.popout_ref.current) {
                            el = ReactDOM.findDOMNode(popout);
                            if ($(e.target).closest(el).length) {
                                return
                            }
                        }
                        return _this.close()
                    }
                }(this));
                return $(document.body).on("mousedown", this.click_outside_handler)
            },
            componentWillUnmount: function() {
                if (this.click_outside_handler) {
                    return $(document.body).off("mousedown", this.click_outside_handler)
                }
            },
            close: function() {
                if (!this.state.open) {
                    return
                }
                this.setState({
                    open: false
                });
                return $("document.body").off("mousedown", this.click_outside_handler)
            },
            popout_position: function() {
                var el, rect;
                if (!this.props.popout_portal_target) {
                    return
                }
                el = ReactDOM.findDOMNode(this);
                rect = el.getBoundingClientRect();
                return {
                    left: Math.trunc(rect.right + window.scrollX),
                    top: Math.trunc(rect.top + window.scrollY)
                }
            },
            popout_on_left: function() {
                var el, popout_right;
                el = $(ReactDOM.findDOMNode(this));
                popout_right = el.offset().left + el.width() + 250;
                return popout_right > $(window).width() + $(window).scrollLeft()
            },
            render_color_popout: function() {
                var el, popout;
                this.popout_ref || (this.popout_ref = React.createRef());
                popout = R.Forms.ColorInputPopup({
                    ref: this.popout_ref,
                    palette: this.props.palette,
                    color: this.state.last_value,
                    allow_empty: this.props.allow_empty,
                    set_color: this.set_color,
                    position: this.state.popout_position
                });
                if (el = this.props.popout_portal_target) {
                    popout = P.PortalElement({
                        container_el: el
                    }, popout)
                }
                return popout
            },
            render: function() {
                var current_color;
                current_color = this.state.last_value || "#ffffff";
                this.input_ref || (this.input_ref = React.createRef());
                return this.enclose({
                    className: classNames(this.props.className, {
                        picker_open: this.state.open,
                        picker_left: this.state.on_left,
                        color_error: this.state.has_error
                    })
                }, input({
                    ref: this.input_ref,
                    type: "text",
                    className: "color_text_input",
                    name: this.props.name,
                    defaultValue: this.props.value || this.props.defaultValue,
                    placeholder: this.props.defaultValue || "Color",
                    onBlur: this.on_blur,
                    onFocus: this.open,
                    onKeyDown: function(_this) {
                        return function(e) {
                            switch (e.keyCode) {
                                case 9:
                                    return _this.close()
                            }
                        }
                    }(this),
                    onKeyUp: function(_this) {
                        return function(e) {
                            return _this.set_color_from_input()
                        }
                    }(this)
                }), div({
                    className: "color_swatch",
                    onClick: this.open,
                    style: {
                        backgroundColor: current_color
                    }
                }), this.state.open ? this.render_color_popout() : void 0)
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, PATTERNS, _rdf, a, br, button, code, create_line_icon, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, line, ol, optgroup, option, p, path, pre, rect, section, select, span, strong, table, tbody, td, textarea, tr, types, ul, slice = [].slice,
            hasProp = {}.hasOwnProperty;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Forms");
        types = PropTypes;
        table = ReactDOMFactories.table, tbody = ReactDOMFactories.tbody, tr = ReactDOMFactories.tr, td = ReactDOMFactories.td;
        P("MarkdownInput", {
            pure: true,
            propTypes: {
                name: types.string,
                value: types.string
            },
            getDefaultProps: function() {
                return {
                    max_default_height: 400
                }
            },
            componentWillUnmount: function() {
                return this.unmounted = true
            },
            componentDidMount: function() {
                var inner_height, total_height;
                total_height = this.input_ref.current.scrollHeight;
                inner_height = this.input_ref.current.clientHeight;
                if (total_height > inner_height) {
                    this.setState({
                        default_height: Math.min(total_height, this.props.max_default_height)
                    })
                }
                if (this.props.autofocus) {
                    return _.defer(function(_this) {
                        return function() {
                            var ref;
                            return (ref = _this.input_ref.current) != null ? ref.focus() : void 0
                        }
                    }(this))
                }
            },
            get_value: function() {
                var ref;
                return (ref = this.input_ref.current) != null ? ref.value : void 0
            },
            set_value: function(value) {
                return this.input_ref.current.value = value
            },
            click_bold_text: function(e) {
                return this.wrap_selection("**", "**")
            },
            click_italic_text: function(e) {
                return this.wrap_selection("*", "*")
            },
            click_insert_link: function(e) {
                var input_el, select_end, t;
                t = this.get_selected_text();
                input_el = this.input_ref.current;
                if (t.match(/^https?:\/\/[^\s]+$/)) {
                    this.wrap_selection("[](", ")");
                    input_el.selectionStart = input_el.selectionStart - "](".length;
                    return input_el.selectionEnd = input_el.selectionStart
                } else {
                    this.wrap_selection("[", "](url)");
                    if (t.length > 0) {
                        select_end = input_el.selectionEnd;
                        input_el.selectionStart = select_end + "](".length;
                        return input_el.selectionEnd = select_end + "](url".length
                    }
                }
            },
            click_insert_video: function(e) {
                return I.Lightbox.open(P.MarkdownVideoEmbedLightbox({
                    on_submit: function(_this) {
                        return function(embed_code) {
                            return _this.insert_line(embed_code)
                        }
                    }(this)
                }))
            },
            click_insert_image: function(e) {
                return I.Lightbox.open_remote(I.root_url("dashboard/upload-image"), I.PickImageLightbox, function(_this) {
                    return function(image_url) {
                        var input_el;
                        I.Lightbox.close();
                        if (_this.unmounted) {
                            return
                        }
                        if (input_el = _this.input_ref.current) {
                            return _this.insert_line("![](" + image_url + ")")
                        }
                    }
                }(this))
            },
            click_show_help: function(e) {
                return I.Lightbox.open(P.MarkdownHelpLightbox({}))
            },
            get_selected_text: function() {
                var input_el;
                if (input_el = this.input_ref.current) {
                    return input_el.value.substring(input_el.selectionStart, input_el.selectionEnd)
                } else {
                    return ""
                }
            },
            wrap_selection: function(left, right) {
                var input_el, inserted, replacement, select_end, select_start, text_after, text_before, text_selected, value;
                input_el = this.input_ref.current;
                select_start = input_el.selectionStart;
                select_end = input_el.selectionEnd;
                value = input_el.value;
                text_before = value.substring(0, input_el.selectionStart);
                text_after = value.substring(input_el.selectionEnd, value.length);
                text_selected = value.substring(input_el.selectionStart, input_el.selectionEnd);
                input_el.focus();
                replacement = "" + left + (text_selected || "") + right;
                inserted = document.execCommand("insertText", false, replacement);
                if (!inserted) {
                    if (typeof input_el.setRangeText === "function") {
                        input_el.setRangeText(replacement)
                    }
                }
                input_el.selectionStart = select_start + left.length;
                return input_el.selectionEnd = select_end + left.length
            },
            insert_line: function(text) {
                var input_el, inserted;
                input_el = this.input_ref.current;
                input_el.focus();
                inserted = document.execCommand("insertText", false, text);
                if (!inserted) {
                    if (typeof input_el.setRangeText === "function") {
                        input_el.setRangeText(text)
                    }
                    input_el.selectionStart = input_el.selectionStart + text.length;
                    return input_el.selectionEnd = input_el.selectionEnd
                }
            },
            on_hotkey_keydown: function(e) {
                var base;
                if (!(e.metaKey || e.ctrlKey)) {
                    return
                }
                switch (e.key) {
                    case "b":
                        this.click_bold_text(e);
                        break;
                    case "i":
                        this.click_italic_text(e);
                        break;
                    case "k":
                        this.click_insert_link(e);
                        break;
                    case "Enter":
                        if (typeof(base = this.props).on_submit_hotkey === "function") {
                            base.on_submit_hotkey()
                        }
                        break;
                    default:
                        return
                }
                return e.preventDefault()
            },
            render: function() {
                var ref;
                return this.enclose({}, ul({
                    className: "markdown_toolbar"
                }, li({}, button({
                    tabIndex: -1,
                    type: "button",
                    onClick: this.click_show_help,
                    title: "Markdown Help"
                }, R.Icons.Markdown)), li({}, button({
                    tabIndex: -1,
                    type: "button",
                    onClick: this.click_bold_text,
                    title: "Bold"
                }, R.Icons.FormatBold)), li({}, button({
                    tabIndex: -1,
                    type: "button",
                    onClick: this.click_italic_text,
                    title: "Italic"
                }, R.Icons.FormatItalic)), li({}, button({
                    tabIndex: -1,
                    type: "button",
                    title: "Insert link",
                    onClick: this.click_insert_link
                }, R.Icons.InsertLink)), li({}, button({
                    tabIndex: -1,
                    type: "button",
                    title: "Insert image",
                    onClick: this.click_insert_image
                }, R.Icons.InsertImage)), li({}, button({
                    tabIndex: -1,
                    type: "button",
                    title: "Insert video",
                    onClick: this.click_insert_video
                }, R.Icons.InsertVideo))), textarea({
                    name: this.props.name,
                    ref: this.input_ref || (this.input_ref = React.createRef()),
                    defaultValue: this.get_default_value(),
                    className: "markdown_textarea",
                    onKeyDown: this.on_hotkey_keydown,
                    placeholder: this.props.placeholder,
                    required: this.props.required,
                    style: ((ref = this.state) != null ? ref.default_height : void 0) ? {
                        height: this.state.default_height + "px"
                    } : void 0,
                    onChange: function(_this) {
                        return function(e) {
                            var base, value;
                            value = e.target.value;
                            if (typeof(base = _this.props).on_change === "function") {
                                base.on_change(value)
                            }
                            if (_this.props.remember_key) {
                                _this.set_memory || (_this.set_memory = _.throttle(function(value) {
                                    return I.store_memory(this.remember_key(), value)
                                }, 500));
                                return _this.set_memory(value)
                            }
                        }
                    }(this)
                }))
            },
            get_default_value: function() {
                var v;
                if (v = this.props.value || this.props.defaultValue) {
                    return v
                }
                if (this.props.remember_key) {
                    if (v = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem(this.remember_key()) : void 0) {
                        return v
                    }
                }
            },
            remember_key: function() {
                return "inputmemory:" + this.props.remember_key
            },
            clear_memory: function() {
                return I.clear_memory(this.remember_key())
            }
        });
        R.Icons || (R.Icons = {});
        path = ReactDOMFactories.path, line = ReactDOMFactories.line, rect = ReactDOMFactories.rect;
        R.Icons.Markdown = React.createElement("svg", {
            className: classNames("svgicon markdown_icon"),
            role: "img",
            version: "1.1",
            viewBox: "0 0 208 128",
            fill: "currentColor"
        }, path({
            d: "M193 128H15a15 15 0 0 1-15-15V15A15 15 0 0 1 15 0h178a15 15 0 0 1 15 15v98a15 15 0 0 1-15 15zM50 98V59l20 25 20-25v39h20V30H90L70 55 50 30H30v68zm134-34h-20V30h-20v34h-20l30 35z"
        }));
        create_line_icon = function() {
            var contents, props, ref;
            props = arguments[0], contents = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return React.createElement.apply(React, ["svg", {
                className: classNames("svgicon", props.className),
                role: "img",
                version: "1.1",
                viewBox: "0 0 24 24",
                width: "24",
                height: "24",
                fill: (ref = props != null ? props.fill : void 0) != null ? ref : "none",
                stroke: "currentColor",
                strokeWidth: "3",
                strokeLinejoin: "round",
                "aria-hidden": true
            }].concat(slice.call(contents)))
        };
        R.Icons.FormatBold = create_line_icon({
            className: "icon_format_bold"
        }, path({
            d: "M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
        }), path({
            d: "M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
        }));
        R.Icons.FormatItalic = create_line_icon({
            className: "icon_format_italic"
        }, line({
            x1: "19",
            y1: "4",
            x2: "10",
            y2: "4"
        }), line({
            x1: "14",
            y1: "20",
            x2: "5",
            y2: "20"
        }), line({
            x1: "15",
            y1: "4",
            x2: "9",
            y2: "20"
        }));
        R.Icons.InsertLink = create_line_icon({
            className: "icon_insert_link"
        }, path({
            d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        }), path({
            d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        }));
        R.Icons.InsertImage = create_line_icon({
            className: "icon_insert_image"
        }, rect({
            x: "3",
            y: "3",
            width: "18",
            height: "18",
            rx: "2",
            ry: "2"
        }), React.createElement("circle", {
            cx: "8.5",
            cy: "8.5",
            r: "1.5"
        }), React.createElement("polyline", {
            points: "21 15 16 10 5 21"
        }));
        R.Icons.InsertVideo = create_line_icon({
            className: "icon_insert_video"
        }, path({
            d: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
        }), React.createElement("polygon", {
            points: "9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"
        }));
        PATTERNS = {
            youtube: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:\-nocookie)?\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.\-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi,
            vimeo: /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/,
            sketchfab_old: /https?:\/\/(?:www\.)?sketchfab\.com\/models\/([\w]+)($|\/)/,
            sketchfab: /https?:\/\/(?:www\.)?sketchfab\.com\/3d-models\/.*?-([^-]+)$/
        };
        P("MarkdownVideoEmbedLightbox", {
            pure: true,
            getInitialState: function() {
                return {
                    is_valid: false
                }
            },
            componentDidMount: function() {
                return _.defer(function(_this) {
                    return function() {
                        var ref;
                        return (ref = _this.input_ref.current) != null ? ref.focus() : void 0
                    }
                }(this))
            },
            generate_youtube_embed_code: function(video_id) {
                return '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + video_id + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
            },
            generate_vimeo_embed_code: function(video_id) {
                return '<iframe src="https://player.vimeo.com/video/' + video_id + '" width="560" height="315" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>'
            },
            generate_sketchfab_embed_code: function(model_id) {
                return '<iframe width="560" height="315" src="https://sketchfab.com/models/' + model_id + '/embed" frameborder="0" allow="autoplay; fullscreen; vr" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>'
            },
            parse_input_value: function() {
                var m, pattern, ref, res, type, value, video_id;
                value = $.trim(((ref = this.input_ref.current) != null ? ref.value : void 0) || "");
                if (value.match(/<iframe/i)) {
                    return value
                }
                for (type in PATTERNS) {
                    if (!hasProp.call(PATTERNS, type)) continue;
                    pattern = PATTERNS[type];
                    m = value.match(pattern);
                    if (!m) {
                        continue
                    }
                    switch (type) {
                        case "youtube":
                            video_id = (res = m[0].match(/v=([^>"'&]+)/)) ? res[1] : (res = m[0].match(/embed\/([^>"'&\/]+)/)) ? res[1] : void 0;
                            if (video_id) {
                                return this.generate_youtube_embed_code(video_id)
                            }
                            break;
                        case "vimeo":
                            if (video_id = m[2]) {
                                return this.generate_vimeo_embed_code(video_id)
                            }
                            break;
                        case "sketchfab":
                        case "sketchfab_old":
                            if (video_id = m[1]) {
                                return this.generate_sketchfab_embed_code(video_id)
                            }
                            break;
                        default:
                            console.log(type, m)
                    }
                }
            },
            render: function() {
                return R.Lightbox({
                    className: classNames(this.enclosing_class_name(), "compact")
                }, h2({}, "Embed Video"), form({
                    className: "form",
                    onSubmit: this.on_submit || (this.on_submit = function(_this) {
                        return function(e) {
                            var base;
                            e.preventDefault();
                            if (!(_this.state.is_valid && _this.state.embed_code)) {
                                return
                            }
                            if (typeof(base = _this.props).on_submit === "function") {
                                base.on_submit(_this.state.embed_code)
                            }
                            return I.Lightbox.close()
                        }
                    }(this))
                }, div({
                    className: "label"
                }, "Youtube/Vimeo/Sketchfab URL or ", code({}, "<iframe>"), " embed code"), div({
                    className: "input_split"
                }, input({
                    type: "text",
                    required: "required",
                    placeholder: "Please paste a valid URL or embed code",
                    ref: this.input_ref || (this.input_ref = React.createRef()),
                    onChange: this.on_change || function(_this) {
                        return function(e) {
                            var embed_code;
                            embed_code = _this.parse_input_value();
                            return _this.setState({
                                embed_code: embed_code,
                                is_valid: !!embed_code
                            })
                        }
                    }(this)
                }), " ", button({
                    disabled: !this.state.is_valid,
                    className: classNames("button", {
                        disabled: !this.state.is_valid
                    })
                }, "Insert"))))
            }
        });
        P("MarkdownHelpLightbox", {
            pure: true,
            render: function() {
                var pair;
                pair = function() {
                    var left, rest;
                    left = arguments[0], rest = 2 <= arguments.length ? slice.call(arguments, 1) : [];
                    return tr({}, td({
                        className: "format_type"
                    }, left), td.apply(null, [{
                        className: "format_example"
                    }].concat(slice.call(rest))))
                };
                return R.Lightbox({
                    className: classNames(this.enclosing_class_name(), "compact")
                }, h2({}, "Quick Markdown Guide"), p({}, "Markdown is a writing format that converts into HTML."), div({
                    className: "table_wrapper"
                }, table({
                    className: "nice_table"
                }, tbody({}, pair("Bold", "**Bolded text here**"), pair("Italic", "*Emphasized text here*"), pair("Bullet list", "* First item", br({}), "* Second item"), pair("Link", "[Linked text](http://example.com)"), pair("Blockquote", "> Quoted text here", br({}), "> Can span multiple lines"), pair("Code", "```", br({}), 'print("Hello world")', br({}), "```"), pair("Video embeds", em({}, "Paste embed code directly"))))), p({}, a({
                    href: "https://commonmark.org/help/",
                    target: "_blank"
                }, "Extended tutorial ↗"), ". You can also use a subset of HTML directly for advanced formatting."))
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var _rdf, a, br, button, code, create_line_icon, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, ul, slice = [].slice;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        R.Icons || (R.Icons = {});
        create_line_icon = function() {
            var contents, props, ref;
            props = arguments[0], contents = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return React.createElement.apply(React, ["svg", {
                className: classNames("svgicon", props.className),
                role: "img",
                version: "1.1",
                viewBox: "0 0 24 24",
                width: "24",
                height: "24",
                fill: (ref = props != null ? props.fill : void 0) != null ? ref : "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinejoin: "round",
                strokeLinecap: "round",
                "aria-hidden": true
            }].concat(slice.call(contents)))
        };
        R.Icons.TriUp = create_line_icon({
            className: "icon_tri_up",
            fill: "currentColor"
        }, React.createElement("polygon", {
            points: "2 18 12 6 22 18"
        }));
        R.Icons.TriDown = create_line_icon({
            className: "icon_tri_down",
            fill: "currentColor"
        }, React.createElement("polygon", {
            points: "2 6 12 18 22 6"
        }));
        R.Icons.Filter = create_line_icon({
            className: "icon_filter"
        }, React.createElement("polygon", {
            points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
        }));
        R.Icons.Edit = create_line_icon({
            className: "icon_edit"
        }, React.createElement("path", {
            d: "M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"
        }), React.createElement("polygon", {
            points: "18 2 22 6 12 16 8 16 8 12 18 2"
        }))
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, counter, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Forms");
        types = PropTypes;
        counter = 0;
        P("Image", {
            pure: true,
            getInitialState: function() {
                return {
                    loaded: false
                }
            },
            render: function() {
                return img({
                    className: classNames(this.enclosing_class_name(), this.props.className, {
                        image_loading: !this.state.loaded
                    }),
                    src: this.props.src,
                    onLoad: function(_this) {
                        return function() {
                            var base;
                            _this.setState({
                                loaded: true
                            });
                            return typeof(base = _this.props).on_load === "function" ? base.on_load() : void 0
                        }
                    }(this)
                })
            }
        });
        P("Video", {
            pure: true,
            render: function() {
                return React.createElement("video", {
                    width: 200,
                    loop: true,
                    muted: true,
                    autoPlay: true,
                    src: this.props.src
                })
            }
        });
        P("ImageUploader", {
            pure: true,
            propTypes: {
                upload_url: types.string.isRequired,
                name: types.string.isRequired,
                thumb_size: types.string,
                label: types.string,
                upload: types.object,
                show_replace: types.bool
            },
            getDefaultProps: function() {
                return {
                    remove_button_classes: ["button", "outline", "small"],
                    replace_button_classes: ["button", "outline", "small"],
                    upload_button_classes: "button"
                }
            },
            getInitialState: function() {
                return {
                    uploads: this.props.upload ? [this.props.upload] : this.props.uploads
                }
            },
            componentDidMount: function() {
                return this.dispatch({
                    remove_image: function(_this) {
                        return function(e, upload_idx) {
                            var base, to_remove, upload;
                            to_remove = _this.state.uploads[upload_idx];
                            _this.setState({
                                uploads: function() {
                                    var i, len, ref, results;
                                    ref = this.state.uploads;
                                    results = [];
                                    for (i = 0, len = ref.length; i < len; i++) {
                                        upload = ref[i];
                                        if (upload !== to_remove) {
                                            results.push(upload)
                                        }
                                    }
                                    return results
                                }.call(_this)
                            });
                            if (!_this.props.multiple) {
                                return typeof(base = _this.props).on_upload === "function" ? base.on_upload(null) : void 0
                            }
                        }
                    }(this),
                    pick_image: function(_this) {
                        return function(e, image_uploading_fn) {
                            var completed_uploads, mark_uploads_complete;
                            completed_uploads = {};
                            mark_uploads_complete = function(uploads) {
                                var base, i, len, newly_completed, upload;
                                newly_completed = function() {
                                    var i, len, results;
                                    results = [];
                                    for (i = 0, len = uploads.length; i < len; i++) {
                                        upload = uploads[i];
                                        if (completed_uploads[upload.id]) {
                                            continue
                                        }
                                        completed_uploads[upload.id] = true;
                                        results.push(upload)
                                    }
                                    return results
                                }();
                                if (!newly_completed.length) {
                                    return
                                }
                                for (i = 0, len = newly_completed.length; i < len; i++) {
                                    upload = newly_completed[i];
                                    if (typeof(base = _this.props).on_upload === "function") {
                                        base.on_upload(upload)
                                    }
                                }
                                return _this.setState({
                                    uploads: (_this.state.uploads || []).concat(newly_completed)
                                })
                            };
                            return I.upload_image({
                                url: _this.props.upload_url,
                                accept: _this.props.accept,
                                thumb_size: _this.props.thumb_size,
                                multiple: _this.props.multiple,
                                max_size: _this.props.max_size,
                                on_start_upload: function() {
                                    if (!_this.state.uploading) {
                                        _this.setState({
                                            uploading: true
                                        })
                                    }
                                    return typeof image_uploading_fn === "function" ? image_uploading_fn.apply(null, arguments) : void 0
                                }
                            }).progress(function(event, sent, total) {
                                var args, i, len, percents, prog, res, uploads;
                                percents = [];
                                uploads = [];
                                args = typeof arguments[0] === "string" ? [arguments] : arguments;
                                for (i = 0, len = args.length; i < len; i++) {
                                    prog = args[i];
                                    if (!prog) {
                                        continue
                                    }
                                    switch (prog[0]) {
                                        case "progress":
                                            event = prog[0], sent = prog[1], total = prog[2];
                                            percents.push(sent / total);
                                            break;
                                        case "upload_saved":
                                            res = prog[1];
                                            if (res.errors) {
                                                continue
                                            }
                                            uploads.push(res.upload)
                                    }
                                }
                                if (percents.length) {
                                    _this.setState({
                                        progress: Math.min.apply(Math, percents)
                                    })
                                }
                                return mark_uploads_complete(uploads)
                            }).fail(function(err) {
                                console.error("upload failed", err);
                                return _this.setState({
                                    uploading: false,
                                    upload_error: true,
                                    errors: [err]
                                })
                            }).done(function(res) {
                                if (res.upload) {
                                    mark_uploads_complete([res.upload])
                                }
                                if (res.errors) {
                                    _this.setState({
                                        uploading: false,
                                        upload_error: true,
                                        errors: res.errors
                                    });
                                    return
                                }
                                return _this.setState({
                                    uploading: false
                                })
                            })
                        }
                    }(this)
                })
            },
            render_existing_upload: function(upload, idx) {
                var input_name;
                input_name = this.props.multiple ? this.props.name + "[" + (idx + 1) + "]" : this.props.name;
                return div({
                    className: "existing_upload",
                    key: upload.id
                }, input({
                    type: "hidden",
                    name: input_name,
                    value: upload.id
                }), upload.thumb_url ? div({
                    className: "preview_image"
                }, upload.thumb_url.match(/\.mp4$/) ? P.Video({
                    src: upload.thumb_url
                }) : P.Image({
                    src: upload.thumb_url
                })) : void 0, this.props.children, div({
                    className: "existing_upload_tools"
                }, this.props.show_replace ? button({
                    className: classNames("replace_image_btn", this.props.replace_button_classes),
                    type: "button",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("pick_image", function() {
                                return _this.trigger("remove_image", idx)
                            })
                        }
                    }(this)
                }, "Replace image") : void 0, button({
                    className: classNames("remove_image_btn", this.props.remove_button_classes),
                    type: "button",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("remove_image", idx)
                        }
                    }(this)
                }, "Remove image")))
            },
            render: function() {
                var have_uploads, ref, ref1, ref2, ref3;
                this.autogen_id = "image-uploader-" + counter++;
                have_uploads = !!((ref = this.state.uploads) != null ? ref.length : void 0);
                return this.enclose({
                    className: classNames(this.props.className, {
                        no_upload: !have_uploads,
                        have_upload: !!have_uploads
                    })
                }, this.props.label ? label({
                    className: "label",
                    htmlFor: this.autogen_id
                }, this.props.label) : void 0, this.state.errors ? R.Forms.FormErrors({
                    errors: this.state.errors,
                    title: "Upload failed",
                    animated: false,
                    scroll_into_view: false
                }) : void 0, !(this.props.multiple || ((ref1 = this.state.uploads) != null ? ref1.length : void 0)) ? input({
                    type: "hidden",
                    name: this.props.name,
                    value: ""
                }) : void 0, this.state.uploading ? div({
                    className: "upload_progress"
                }, "Uploading " + ((this.state.progress || 0) * 100).toFixed(2) + "%") : void 0, this.props.multiple || !((ref2 = this.state.uploads) != null ? ref2.length : void 0) ? button({
                    id: this.autogen_id,
                    disabled: !!this.state.uploading,
                    className: classNames(this.props.upload_button_classes, {
                        small: this.props.compact,
                        disabled: !!this.state.uploading
                    }),
                    type: "button",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("pick_image")
                        }
                    }(this)
                }, this.props.upload_label || (this.props.multiple ? "Upload images" : "Upload image")) : void 0, ((ref3 = this.state.uploads) != null ? ref3.length : void 0) ? div({
                    className: "existing_uploads",
                    children: this.state.uploads.map(this.render_existing_upload)
                }) : void 0)
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var _rdf, a, br, button, code, current_focus_trap, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        R.Icons || (R.Icons = {});
        current_focus_trap = null;
        R.Icons.Close = function(props) {
            var height, ref, ref1, width;
            if (props == null) {
                props = {}
            }
            width = (ref = props.width) != null ? ref : 24;
            height = (ref1 = props.height) != null ? ref1 : width;
            return React.createElement("svg", {
                className: "svgicon icon_close",
                strokeLinecap: "round",
                stroke: "currentColor",
                role: "img",
                version: "1.1",
                viewBox: "0 0 24 24",
                strokeWidth: "2",
                width: width,
                height: height,
                strokeLinejoin: "round",
                "aria-hidden": true,
                fill: "none"
            }, React.createElement("line", {
                x1: "18",
                y1: "6",
                x2: "6",
                y2: "18"
            }), React.createElement("line", {
                x1: "6",
                y1: "6",
                x2: "18",
                y2: "18"
            }))
        };
        R.component("Lightbox", {
            is_modal_dialog: function() {
                var lb_container;
                lb_container = document.getElementById("lightbox_container");
                return lb_container != null ? lb_container.contains(this.container_ref.current) : void 0
            },
            getInitialState: function() {
                return {}
            },
            componentDidMount: function() {
                if (!this.is_modal_dialog()) {
                    return
                }
                if (current_focus_trap) {
                    console.warn("A dialog already has the focus trap")
                } else {
                    this.detect_focus = function(_this) {
                        return function(e) {
                            var container;
                            container = _this.container_ref.current;
                            if (container && "contains" in container) {
                                if (!(container === e.target || container.contains(e.target))) {
                                    return container.focus()
                                }
                            }
                        }
                    }(this);
                    $(document.body).on("focusin", this.detect_focus);
                    current_focus_trap = this
                }
                return this.setState({
                    previously_focused: document.activeElement,
                    is_modal_dialog: true
                }, function() {
                    return _.defer(function(_this) {
                        return function() {
                            var ref;
                            return (ref = _this.container_ref.current) != null ? ref.focus() : void 0
                        }
                    }(this))
                })
            },
            componentWillUnmount: function() {
                var ref;
                if (this.detect_focus) {
                    $(document.body).off("focusin", this.detect_focus);
                    current_focus_trap = null;
                    delete this.detect_focus
                }
                return (ref = this.state.previously_focused) != null ? ref.focus() : void 0
            },
            render: function() {
                return div({
                    className: classNames("lightbox", this.props.className),
                    style: this.props.style,
                    role: this.state.is_modal_dialog ? "dialog" : void 0,
                    "aria-modal": this.state.is_modal_dialog ? "true" : void 0,
                    tabIndex: this.state.is_modal_dialog ? -1 : void 0,
                    ref: this.container_ref || (this.container_ref = React.createRef())
                }, this.props.close !== false ? button({
                    className: "close_button",
                    type: "button",
                    "aria-label": "Close Dialog"
                }, R.Icons.Close({
                    width: 18
                })) : void 0, this.props.children)
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        R.component("SlideDown", {
            getInitialState: function() {
                return {}
            },
            getDefaultProps: function() {
                return {
                    duration: 200,
                    delay: 1
                }
            },
            componentDidMount: function() {
                var el;
                el = ReactDOM.findDOMNode(this);
                return this.timer = window.setTimeout(function(_this) {
                    return function() {
                        _this.setState({
                            height: el.scrollHeight || false
                        });
                        _this.timer = window.setTimeout(function() {
                            return _this.setState({
                                animated: true
                            })
                        }, _this.props.duration + 50);
                        return _this.wrapper_ref.current.scrollTop = 0
                    }
                }(this), this.props.delay)
            },
            componentWillUnmount: function() {
                if (this.timer) {
                    window.clearTimeout(this.timer);
                    return delete this.timer
                }
            },
            render: function() {
                var style;
                style = this.state.height === false ? null : this.state.height ? this.state.animated ? null : {
                    height: this.state.height + "px",
                    overflow: "hidden",
                    transition: "height " + this.props.duration / 1e3 + "s ease"
                } : {
                    height: 0,
                    overflow: "scroll",
                    transition: "height 0.2s ease"
                };
                return div({
                    style: style,
                    className: this.props.className,
                    ref: this.wrapper_ref || (this.wrapper_ref = React.createRef())
                }, this.props.children)
            }
        })
    })
}).call(this);