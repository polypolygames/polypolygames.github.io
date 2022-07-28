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
        hasProp = {}.hasOwnProperty,
        bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments)
            }
        };
    I.setup_layout = function() {
        $("#inner_column").max_height($(".header_widget").outerHeight(true) || 0);
        $(window).on("message", function(_this) {
            return function(e) {
                var message, origin;
                origin = new RegExp("\\/\\/" + $(document.body).data("host") + "\\/");
                if (!e.originalEvent.origin.match) {
                    return
                }
                message = e.originalEvent.data;
                switch (message.name) {
                    case "dimensions":
                        return parent.postMessage({
                            width: $(document).width(),
                            height: $(document).height()
                        }, "*")
                }
            }
        }(this));
        return new I.ViewGameFooter("#view_game_footer")
    };
    I.EmbedGameLightbox = function(superClass) {
        extend(EmbedGameLightbox, superClass);

        function EmbedGameLightbox() {
            return EmbedGameLightbox.__super__.constructor.apply(this, arguments)
        }
        return EmbedGameLightbox
    }(I.Lightbox);
    I.ViewGameFooter = function() {
        function ViewGameFooter(el) {
            this.el = $(el);
            this.el.dispatch("click", {
                embed_game_btn: function(_this) {
                    return function(btn) {
                        return I.Lightbox.open_remote(btn.data("lightbox_url"), I.EmbedGameLightbox)
                    }
                }(this),
                report_game_btn: function(_this) {
                    return function(btn) {
                        return I.Lightbox.open_remote_react(btn.data("lightbox_url"), function(props) {
                            return R.Game.ReportLightbox(props)
                        })
                    }
                }(this)
            })
        }
        return ViewGameFooter
    }();
    I.GameUserTools = function() {
        function GameUserTools(el) {
            this.el = $(el);
            I.tracked_links(this.el, "view_game", "user_tools");
            I.has_follow_button(this.el, {
                cls: "follow_user_btn",
                animate_follow: I.is_mobile() ? "animate_popout" : void 0
            });
            this.el.dispatch("click", {
                add_to_collection_btn: function(_this) {
                    return function(btn) {
                        if (!I.current_user) {
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.CollectionLightbox)
                    }
                }(this),
                rate_game_btn: function(_this) {
                    return function(btn) {
                        if (!I.current_user) {
                            return "continue"
                        }
                        return I.Lightbox.open_remote_react(btn.attr("href"), function(props) {
                            props.on_save_rating = function(res) {
                                return _this.el.find(".rate_game_btn").addClass("has_rating")
                            };
                            props.on_delete_rating = function(res) {
                                return _this.el.find(".rate_game_btn").removeClass("has_rating")
                            };
                            return R.Library.RateGameLightbox(props)
                        })
                    }
                }(this)
            });
            setTimeout(function(_this) {
                return function() {
                    return _this.el.removeClass("hidden")
                }
            }(this), 200)
        }
        return GameUserTools
    }();
    I.FirstGameLightbox = function(superClass) {
        extend(FirstGameLightbox, superClass);

        function FirstGameLightbox() {
            this.first_show = bind(this.first_show, this);
            return FirstGameLightbox.__super__.constructor.apply(this, arguments)
        }
        FirstGameLightbox.prototype.first_show = function() {
            I.event("view_game", "first_game_lb", "show");
            I.add_facebook(function(_this) {
                return function() {
                    var cat;
                    cat = "view_game";
                    FB.Event.subscribe("edge.create", function(url) {
                        return I.event(cat, "fb", "like")
                    });
                    FB.Event.subscribe("edge.remove", function(url) {
                        return I.event(cat, "fb", "unlike")
                    });
                    return FB.Event.subscribe("message.send", function(url) {
                        return I.event(cat, "fb", "share")
                    })
                }
            }(this));
            return I.add_twitter()
        };
        return FirstGameLightbox
    }(I.Lightbox);
    I.GameGoalBanner = function() {
        function GameGoalBanner(el) {
            this.el = $(el);
            this.el.dispatch("click", {
                buy_btn: function(_this) {
                    return function(btn) {
                        I.event("view_game", "goal_banner", "contribute_btn");
                        if (I.is_mobile()) {
                            btn.attr("href", I.add_params(btn.attr("href"), {
                                initiator: "mobile"
                            }));
                            return "continue"
                        }
                        return $(".buy_row a.buy_btn").click()
                    }
                }(this)
            })
        }
        return GameGoalBanner
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.GameDevlogPost = function() {
        GameDevlogPost.prototype.vote_counts_template = I.lazy_template(GameDevlogPost, "like_button");

        function GameDevlogPost(el, opts) {
            this.render_like_button = bind(this.render_like_button, this);
            this.el = $(el);
            this.image_viewer = new I.ImageViewer(el);
            this.el.dispatch("click", {
                add_to_collection_btn: function(_this) {
                    return function(btn) {
                        if (!I.current_user) {
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.CollectionLightbox)
                    }
                }(this)
            });
            this.render_like_button()
        }
        GameDevlogPost.prototype.render_like_button = function(s) {
            var child, drop;
            drop = this.el.find(".like_button_drop");
            this.like_button_state || (this.like_button_state = drop.data("init"));
            if (s) {
                $.extend(this.like_button_state, s)
            }
            child = drop.html(this.vote_counts_template(this.like_button_state)).children();
            return child.find("form").remote_submit(function(_this) {
                return function(res) {
                    return _this.render_like_button({
                        liked: !_this.like_button_state.liked,
                        likes_count: res.likes_count
                    })
                }
            }(this))
        };
        return GameDevlogPost
    }()
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
    I.GameHeader = function(superClass) {
        extend(GameHeader, superClass);

        function GameHeader() {
            GameHeader.__super__.constructor.apply(this, arguments);
            this.el.dispatch("click", {
                edit_theme_btn: function(_this) {
                    return function() {
                        return _this.toggle_theme_editor()
                    }
                }(this)
            });
            if (window.location.hash.match(/\bedit_theme\b/)) {
                _.defer(function(_this) {
                    return function() {
                        return _this.toggle_theme_editor()
                    }
                }(this))
            }
        }
        GameHeader.prototype.toggle_theme_editor = function() {
            var new_open;
            new_open = !I.theme_editor.state.open;
            I.theme_editor.setState({
                open: new_open
            });
            return $(document.body).toggleClass("theme_editor_open", new_open)
        };
        return GameHeader
    }(I.Header)
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.HtmlEmbed = function() {
        HtmlEmbed.current = $.Deferred().done(function() {
            return window.addEventListener("popstate", function(e) {
                var state;
                state = e.state || {};
                return I.HtmlEmbed.current.done(function(embed) {
                    return embed.synchronize_state(state)
                })
            })
        });
        HtmlEmbed.prototype.ping_time = 1e3;

        function HtmlEmbed(el, opts) {
            this.opts = opts;
            this.load_frame = bind(this.load_frame, this);
            this.el = $(el);
            if (I.HtmlEmbed.current.state() === "resolved") {
                I.HtmlEmbed.current = $.Deferred().resolve(this)
            } else {
                I.HtmlEmbed.current.resolve(this)
            }
            this.load_archive();
            if (window.history.state) {
                this.synchronize_state(window.history.state)
            }
            if (this.opts.width) {
                I.ViewGame.current.then(function(_this) {
                    return function(view) {
                        return view.fit_to_width(_this.opts.width)
                    }
                }(this))
            }
            this.el.dispatch("click", {
                load_iframe_btn: function(_this) {
                    return function(btn) {
                        return _this.load_frame().done(function(frame) {
                            setTimeout(function() {
                                var ref;
                                return (ref = frame[0]) != null ? ref.focus() : void 0
                            }, 100);
                            if (I.is_mobile()) {
                                return _this.enter_fullscreen()
                            } else if (_this.opts.start_maximized) {
                                return _this.enter_maximized()
                            }
                        })
                    }
                }(this),
                fullscreen_btn: function(_this) {
                    return function(btn) {
                        return _this.enter_fullscreen()
                    }
                }(this),
                restore_btn: function(_this) {
                    return function(btn) {
                        _this.load_frame().done(function(frame) {
                            return setTimeout(function() {
                                var ref;
                                return (ref = frame[0]) != null ? ref.focus() : void 0
                            }, 100)
                        });
                        if (I.is_mobile()) {
                            return _this.enter_fullscreen()
                        } else {
                            return _this.enter_maximized()
                        }
                    }
                }(this)
            })
        }
        HtmlEmbed.prototype.synchronize_state = function(state) {
            if (state.maximized) {
                this.enter_maximized(false);
                return setTimeout(function(_this) {
                    return function() {
                        var ref;
                        return (ref = _this.el.find(".game_frame iframe")[0]) != null ? ref.focus() : void 0
                    }
                }(this), 100)
            } else {
                return this.exit_maximized()
            }
        };
        HtmlEmbed.prototype.load_archive = function() {
            if (!this.opts.load_url) {
                return
            }
            return $.get(this.opts.load_url, function(_this) {
                return function(res) {
                    if (res.html) {
                        _this.el.replaceWith(res.html);
                        return
                    }
                    if (res.errors) {
                        _this.el.replaceWith($('<div class="missing_game"></div>').text(res.errors.join(", ")));
                        return
                    }
                    switch (res.status) {
                        case "complete":
                            return _this.el.closest(".view_game_page").addClass("ready");
                        case "extracting":
                            return setTimeout(function() {
                                _this.ping_time += 100;
                                return _this.load_archive()
                            }, _this.ping_time)
                    }
                }
            }(this))
        };
        HtmlEmbed.prototype.mobile_orientation = function() {
            var ratio;
            if (this.opts.orientation) {
                return this.opts.orientation
            }
            if (!(this.opts.width && this.opts.height)) {
                return "landscape"
            }
            ratio = this.opts.width / this.opts.height;
            if (ratio >= 1.4) {
                return "landscape"
            } else if (ratio <= 1.7) {
                return "portrait"
            }
        };
        HtmlEmbed.prototype.load_frame = function() {
            return this._loaded_frame || (this._loaded_frame = $.Deferred(function(_this) {
                return function(d) {
                    var placeholder;
                    placeholder = _this.el.find(".iframe_placeholder");
                    placeholder.replaceWith(placeholder.data("iframe"));
                    _this.iframe = _this.el.find("#game_drop");
                    _this.el.find(".game_frame").addClass("game_loaded").removeClass("game_pending");
                    return d.resolve(_this.iframe)
                }
            }(this)))
        };
        HtmlEmbed.prototype.enter_maximized = function(push_history) {
            if (push_history == null) {
                push_history = true
            }
            if (this.maximized) {
                return
            }
            this.maximized = true;
            return this.load_frame().done(function(_this) {
                return function() {
                    if (window.history && push_history) {
                        window.history.pushState({
                            maximized: true
                        }, document.title)
                    }
                    _this.el.find(".game_frame").addClass("maximized");
                    return $(document.body).addClass("frame_maximized")
                }
            }(this))
        };
        HtmlEmbed.prototype.exit_maximized = function() {
            if (!this.maximized) {
                return
            }
            this.maximized = false;
            this.el.find(".game_frame").removeClass("maximized");
            return $(document.body).removeClass("frame_maximized")
        };
        HtmlEmbed.prototype.enter_fullscreen = function() {
            var frame, orientation;
            frame = this.el.find(".game_frame iframe");
            if (!frame[0]) {
                return
            }
            orientation = this.mobile_orientation();
            if (I.is_fullscreen()) {
                return
            }
            if (!I.request_fullscreen(frame[0], orientation)) {
                return this.enter_maximized()
            }
        };
        return HtmlEmbed
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.ImageViewer = function() {
        ImageViewer.prototype.margin = 40;
        ImageViewer.prototype._template = function() {
            return '<div class="screenshot_lightbox lightbox loading">\n  <div class="screenshot_container">\n    <div class="loader"></div>\n\n    <div class="prev_image_btn">\n      <span class="icon-arrow-left"></span>\n    </div>\n\n    <img class="lb_screenshot hidden" width="400" height="315">\n\n    <div class="next_image_btn">\n      <span class="icon-arrow-right"></span>\n    </div>\n  </div>\n</div>'
        };
        ImageViewer.prototype.size_image = function() {};

        function ImageViewer(el) {
            this.size_image = bind(this.size_image, this);
            this.el = $(el);
            this.el.on("click", "[data-image_lightbox]", function(_this) {
                return function(e) {
                    var all_links, current_image, goto_image, goto_next_image, goto_prev_image, lb, on_image_load, source_link;
                    if (I.is_mobile()) {
                        return
                    }
                    if (!Image) {
                        return
                    }
                    source_link = $(e.currentTarget);
                    all_links = source_link.parent().find("[data-image_lightbox]");
                    I.event("view_game", "screenshots", "show");
                    lb = I.Lightbox.open(_this._template());
                    lb.el.toggleClass("no_tools", all_links.length < 2);
                    current_image = null;
                    on_image_load = function(image) {
                        var $window, ar, h, screenshot, w, window_height, window_width;
                        current_image = image;
                        $window = $(window);
                        window_width = $window.width() - (_this.margin + 20) * 2;
                        window_height = $window.height() - _this.margin * 2;
                        w = image.naturalWidth;
                        h = image.naturalHeight;
                        ar = w / h;
                        if (w > window_width) {
                            w = window_width;
                            h = window_width / ar
                        }
                        if (h > window_height) {
                            w = window_height * ar;
                            h = window_height
                        }
                        screenshot = lb.el.find(".lb_screenshot");
                        screenshot.attr("src", image.src);
                        if (w !== image.naturalWidth || h !== image.naturalHeight) {
                            screenshot.attr("width", Math.floor(w)).attr("height", Math.floor(h))
                        } else {
                            screenshot.attr("width", image.naturalWidth).attr("height", image.naturalHeight)
                        }
                        lb.position();
                        screenshot.removeClass("hidden");
                        return lb.el.removeClass("loading")
                    };
                    goto_image = function(elem) {
                        var image;
                        lb.el.addClass("loading");
                        source_link = elem;
                        image = new Image;
                        image.onload = function(_this) {
                            return function() {
                                return on_image_load(image)
                            }
                        }(this);
                        return image.src = $(elem).attr("href")
                    };
                    goto_prev_image = function() {
                        var prev;
                        prev = source_link.prev("[data-image_lightbox]");
                        if (!prev.length) {
                            prev = $(all_links[all_links.length - 1])
                        }
                        return goto_image(prev)
                    };
                    goto_next_image = function() {
                        var next;
                        next = source_link.next("[data-image_lightbox]");
                        if (!next.length) {
                            next = $(all_links[0])
                        }
                        return goto_image(next)
                    };
                    lb.el.dispatch("click", {
                        lb_screenshot: function(btn) {
                            if (all_links.length < 2) {
                                return I.Lightbox.close()
                            } else {
                                I.event("view_game", "screenshots", "click_screenshot");
                                return goto_next_image()
                            }
                        },
                        prev_image_btn: function(btn) {
                            I.event("view_game", "screenshots", "prev_image_btn");
                            return goto_prev_image()
                        },
                        next_image_btn: function(btn) {
                            I.event("view_game", "screenshots", "next_image_btn");
                            return goto_next_image()
                        }
                    });
                    lb.el.on("i:lightbox_keydown", function(e, ke) {
                        switch (ke.keyCode) {
                            case 37:
                                I.event("view_game", "screenshots", "keyboard_left");
                                return goto_prev_image();
                            case 39:
                                I.event("view_game", "screenshots", "keyboard_right");
                                return goto_next_image();
                            case 32:
                                I.event("view_game", "screenshots", "Keyboard_space");
                                return goto_next_image()
                        }
                    });
                    lb.el.on("i:lightbox_resize", function() {
                        if (current_image) {
                            return on_image_load(current_image)
                        }
                    });
                    goto_image(source_link);
                    return false
                }
            }(this))
        }
        return ImageViewer
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
    I.ViewGame = function() {
        ViewGame.current = $.Deferred();

        function ViewGame(el, game1, opts1) {
            var form;
            this.game = game1;
            this.opts = opts1;
            this.setup_hiding = bind(this.setup_hiding, this);
            this.setup_buy_on_top = bind(this.setup_buy_on_top, this);
            this.register_play = bind(this.register_play, this);
            I.event2("view game", {
                type: this.game.type_name,
                paid: this.game.actual_price > 0
            });
            I.ViewGame.current.resolve(this);
            I.tracked_links($(".jam_banner"), "view_game", "jam_banner");
            form = $(".devlog_banner").find("form").remote_submit(function(_this) {
                return function(res) {
                    return form.end().slideUp("fast")
                }
            }(this), null, [{
                name: "json",
                value: "1"
            }]);
            this.el = $(el);
            this.setup_uploads();
            this.setup_buy_on_top();
            I.tracked_links(this.el, "view_game", "main_column");
            if (this.game.hit_url) {
                $.get(this.game.hit_url)
            }
            if (this.game.play_url) {
                this.register_play()
            }
            this.el.on("click mouseup", ".launch_btn[data-rp]", function(_this) {
                return function(e) {
                    var btn, rp;
                    btn = $(e.currentTarget);
                    if (rp = btn.data("rp")) {
                        btn.data("rp", null);
                        if (!(typeof navigator !== "undefined" && navigator !== null ? typeof navigator.sendBeacon === "function" ? navigator.sendBeacon(rp) : void 0 : void 0)) {
                            return $.get(rp)
                        }
                    }
                }
            }(this));
            this.el.dispatch("click", {
                add_to_collection_btn: function(_this) {
                    return function(btn) {
                        if (I.is_mobile() || !I.current_user) {
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.CollectionLightbox)
                    }
                }(this),
                toggle_info_btn: function(_this) {
                    return function(el) {
                        el.closest(".more_information_toggle").toggleClass("open");
                        return _this.el.find(".info_panel_wrapper").slideToggle()
                    }
                }(this),
                download_btn: function(_this) {
                    return function(btn) {
                        var opts;
                        I.event("view_game", "download", "" + _this.game.id);
                        opts = {};
                        if (!btn.closest(".for_demo").length) {
                            opts.after_download_lightbox = true
                        }
                        I.ConversionTracker.download("1:" + _this.game.id);
                        I.ConversionTracker.flush_now();
                        return _this.prepare_download(btn.data("upload_id"), function(url, res) {
                            if (res.lightbox) {
                                I.start_download(res);
                                return I.Lightbox.open(res.lightbox, I.AfterDownloadLightbox, _this.game)
                            } else {
                                return window.location = url
                            }
                        }, opts)
                    }
                }(this),
                buy_btn: function(_this) {
                    return function(btn) {
                        I.event("view_game", "buy", "" + _this.game.id);
                        if (I.is_mobile()) {
                            btn.attr("href", I.add_params(btn.attr("href"), {
                                initiator: "mobile"
                            }));
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.BuyGameLightbox, _this.game, {
                            is_donate: false
                        })
                    }
                }(this),
                reward_btn: function(_this) {
                    return function(btn) {
                        var $quantity, $reward, href;
                        I.event("view_game", "buy_reward", "" + _this.game.id);
                        href = btn.attr("href");
                        $reward = btn.closest(".reward_footer");
                        $quantity = $reward.find(".quantity_input");
                        if ($quantity) {
                            href = I.add_params(href, {
                                quantity: $quantity.val()
                            })
                        }
                        return I.Lightbox.open_remote(href, I.BuyGameLightbox, _this.game, {
                            is_donate: false
                        })
                    }
                }(this),
                donate_btn: function(_this) {
                    return function(btn) {
                        I.event("view_game", "donate", "" + _this.game.id);
                        if (I.is_mobile()) {
                            btn.attr("href", I.add_params(btn.attr("href"), {
                                initiator: "mobile"
                            }));
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.BuyGameLightbox, _this.game, {
                            is_donate: btn.data("donate")
                        })
                    }
                }(this)
            });
            this.image_viewer = new I.ImageViewer(el);
            this.setup_referrer();
            if (this.opts.first_view) {
                I.Lightbox.open_tpl("first_game_lightbox", I.FirstGameLightbox)
            }
        }
        ViewGame.prototype.register_play = function() {
            return window.setTimeout(function(_this) {
                return function() {
                    return $.get(_this.game.play_url)
                }
            }(this), (this.game.play_after + 3) * 1e3)
        };
        ViewGame.prototype.prepare_download = function(upload_id, fn, params) {
            if (params == null) {
                params = {}
            }
            return I.prepare_download(this.game.slug, upload_id, null, fn, params)
        };
        ViewGame.prototype.setup_buy_on_top = function() {
            var h;
            h = this.el.find(".formatted_description").outerHeight(true);
            if (h < $(window).height() - 100) {
                return this.el.removeClass("buy_on_top")
            }
        };
        ViewGame.prototype.setup_uploads = function() {
            var el, i, len, ref1, results, size;
            this.uploads = this.el.find(".uploads");
            ref1 = this.uploads.find(".upload");
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                el = ref1[i];
                size = $(el).find(".file_size_value");
                results.push(size.html(_.str.formatBytes(parseInt(size.html()))))
            }
            return results
        };
        ViewGame.prototype.setup_hiding = function(el) {
            $(document.body).on("i:lightbox_open", function(_this) {
                return function() {
                    return $(el).css({
                        visibility: "hidden"
                    })
                }
            }(this));
            return $(document.body).on("i:lightbox_close", function(_this) {
                return function() {
                    return $(el).css({
                        visibility: "visible"
                    })
                }
            }(this))
        };
        ViewGame.prototype.fit_to_width = function(width) {
            if (!(width > 920)) {
                return
            }
            if (this.opts.responsive || I.is_mobile()) {
                return $("#inner_column").css({
                    width: "auto",
                    maxWidth: width + "px"
                })
            } else {
                return $("#inner_column").css({
                    width: width + "px",
                    maxWidth: width + "px"
                })
            }
        };
        ViewGame.prototype.setup_referrer = function() {
            var host, ref;
            if (I.ReferrerTracker.has_ref("game", this.game.id)) {
                return
            }
            host = $(document.body).data("host");
            ref = document.referrer;
            if (!ref) {
                return
            }
            if (ref.indexOf(host) >= 0) {
                return
            }
            return I.ReferrerTracker.push("game", this.game.id, "game:" + ref)
        };
        return ViewGame
    }();
    I.ViewFlashGame = function(superClass) {
        extend(ViewFlashGame, superClass);

        function ViewFlashGame(el, game, swf, opts) {
            this.swf = swf;
            ViewFlashGame.__super__.constructor.call(this, el, game, opts);
            this.embed_game();
            this.setup_hiding("#swf_drop")
        }
        ViewFlashGame.prototype.get_size = function(fn) {
            return $.get("/" + this.game.slug + "/swf_size/" + this.swf.id, function(_this) {
                return function(res) {
                    _this.swf.data.swf = res.swf;
                    return typeof fn === "function" ? fn() : void 0
                }
            }(this))
        };
        ViewFlashGame.prototype.embed_game = function(skip_remote) {
            var flash_version, height, ref1, width;
            if (!this.swf) {
                return
            }
            if (!this.swf.data.swf && !skip_remote) {
                return this.get_size(function(_this) {
                    return function() {
                        return _this.embed_game(true)
                    }
                }(this))
            }
            ref1 = this.swf.data.swf, width = ref1.width, height = ref1.height;
            flash_version = swfobject.getFlashPlayerVersion();
            if ((flash_version != null ? flash_version.major : void 0) === 0 && !window.location.hash.match(/\bforce_flash\b/)) {
                this.el.addClass("ready no_flash");
                return $(document.body).addClass("embed_disabled")
            } else {
                swfobject.embedSWF(this.swf.url, "swf_drop", width, height, "11.0.0", false, {}, {
                    wmode: "direct",
                    allowfullscreen: "true"
                });
                this.swf_drop = $("#swf_drop");
                this.swf_drop.parent().width(width).height(height);
                this.fit_to_width(width);
                return this.el.addClass("ready")
            }
        };
        return ViewFlashGame
    }(I.ViewGame);
    I.ViewUnityGame = function(superClass) {
        extend(ViewUnityGame, superClass);

        function ViewUnityGame(el, game, unity1, opts) {
            this.unity = unity1;
            ViewUnityGame.__super__.constructor.call(this, el, game, opts);
            this.embed_game();
            this.setup_hiding("#unity_drop embed")
        }
        ViewUnityGame.prototype.embed_game = function() {
            var drop, track_unity, unity, width;
            if (!this.unity) {
                return
            }
            drop = $("#unity_drop");
            width = drop.width();
            if (width > 920) {
                $("#inner_column").width(width + 40)
            }
            unity = new UnityObject2({
                params: {
                    disableContextMenu: true
                }
            });
            track_unity = _.once(function(status) {
                return I.event("view_game", "unity", "" + status)
            });
            unity.observeProgress(function(_this) {
                return function(progress) {
                    track_unity(progress.pluginStatus);
                    if (progress.pluginStatus === "unsupported") {
                        drop.width("").height("");
                        $("#inner_column").width("");
                        return _this.el.addClass("unity_unsupported")
                    } else {
                        return $(document.body).removeClass("responsive")
                    }
                }
            }(this));
            return unity.initPlugin(drop[0], this.unity.url)
        };
        return ViewUnityGame
    }(I.ViewGame);
    I.ViewJavaGame = function(superClass) {
        extend(ViewJavaGame, superClass);

        function ViewJavaGame(el, game, jar, opts) {
            this.jar = jar;
            this.setup_hiding("#jar_drop applet");
            ViewJavaGame.__super__.constructor.call(this, el, game, opts)
        }
        return ViewJavaGame
    }(I.ViewGame);
    I.ViewHtmlGame = function(superClass) {
        extend(ViewHtmlGame, superClass);

        function ViewHtmlGame() {
            return ViewHtmlGame.__super__.constructor.apply(this, arguments)
        }
        return ViewHtmlGame
    }(I.ViewGame)
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
    I.CommunityArchiveTopicLightbox = function(superClass) {
        extend(CommunityArchiveTopicLightbox, superClass);

        function CommunityArchiveTopicLightbox() {
            this.init = bind(this.init, this);
            return CommunityArchiveTopicLightbox.__super__.constructor.apply(this, arguments)
        }
        CommunityArchiveTopicLightbox.prototype.init = function() {
            var form;
            this.with_redactor(function(_this) {
                return function() {
                    return I.redactor(_this.el.find("textarea"), {
                        minHeight: 100,
                        source: false
                    })
                }
            }(this));
            return form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    form.set_form_errors(res.errors);
                    if (res.errors) {
                        return
                    }
                    return window.location.reload()
                }
            }(this))
        };
        return CommunityArchiveTopicLightbox
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
    I.CommunityBanLightbox = function(superClass) {
        extend(CommunityBanLightbox, superClass);

        function CommunityBanLightbox() {
            this.init = bind(this.init, this);
            return CommunityBanLightbox.__super__.constructor.apply(this, arguments)
        }
        CommunityBanLightbox.prototype.init = function() {
            var form;
            this.with_redactor(function(_this) {
                return function() {
                    return I.redactor(_this.el.find("textarea"), {
                        minHeight: 100,
                        source: false
                    })
                }
            }(this));
            return form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    form.set_form_errors(res.errors);
                    if (res.errors) {
                        return
                    }
                    return _this.el.addClass("after_ban")
                }
            }(this))
        };
        return CommunityBanLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    I.CommunityCategory = function() {
        function CommunityCategory(el) {
            this.el = $(el)
        }
        return CommunityCategory
    }()
}).call(this);
(function() {
    I.CommunityCategoryBans = function() {
        function CommunityCategoryBans(el) {
            this.el = $(el);
            this.el.remote_link(function(_this) {
                return function(res) {
                    if (res.errors) {
                        alert(res.errors.join("\n"));
                        return
                    }
                    return window.location.reload()
                }
            }(this))
        }
        return CommunityCategoryBans
    }()
}).call(this);
(function() {
    I.CommunityCategoryModerators = function() {
        function CommunityCategoryModerators(el) {
            this.el = $(el);
            this.el.remote_link(function(_this) {
                return function(res, el) {
                    if (res.return_to) {
                        return window.location = res.return_to
                    }
                }
            }(this))
        }
        return CommunityCategoryModerators
    }()
}).call(this);
(function() {
    I.CommunityProfile = function() {
        function CommunityProfile(el, opts) {
            var c;
            this.el = $(el);
            new I.FilterPickers(this.el);
            this.carousels = function() {
                var i, len, ref, results;
                ref = this.el.find(".game_carousel_widget");
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    c = ref[i];
                    results.push(new I.GameCarousel($(c)))
                }
                return results
            }.call(this);
            new I.CommunityViewTopic(this.el.find(".recent_posts"), opts)
        }
        return CommunityProfile
    }()
}).call(this);
(function() {
    I.CommunityEditCategory = function() {
        function CommunityEditCategory(el) {
            var form;
            this.el = $(el);
            this.setup_tag_editor();
            form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    if (res.errors) {
                        form.set_form_errors(res.errors);
                        return
                    }
                    if (res.redirect_to) {
                        return window.location = res.redirect_to
                    }
                }
            }(this))
        }
        CommunityEditCategory.prototype.setup_tag_editor = function() {
            var tag_editor, tags;
            tag_editor = this.el.find(".category_tag_editor");
            if (!tag_editor.length) {
                return
            }
            tags = tag_editor.data("tags");
            return ReactDOM.render(R.Community.CategoryEditTags({
                tags: tags
            }), tag_editor[0])
        };
        return CommunityEditCategory
    }()
}).call(this);
(function() {
    I.GameCommunityCategory = function() {
        function GameCommunityCategory(el) {
            var scroller;
            this.el = $(el);
            scroller = this.el.find(".blog_post_grid_widget");
            scroller.lazy_images({
                horizontal: true,
                target: scroller
            })
        }
        return GameCommunityCategory
    }()
}).call(this);
(function() {
    I.GameCommunityHeader = function() {
        function GameCommunityHeader(el) {
            this.el = $(el);
            this.el.dispatch("click", {
                add_to_collection_btn: function(_this) {
                    return function(btn) {
                        if (!I.current_user) {
                            return "continue"
                        }
                        return I.Lightbox.open_remote(btn.attr("href"), I.CollectionLightbox)
                    }
                }(this)
            })
        }
        return GameCommunityHeader
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
    I.CommunityLockTopicLightbox = function(superClass) {
        extend(CommunityLockTopicLightbox, superClass);

        function CommunityLockTopicLightbox() {
            this.init = bind(this.init, this);
            return CommunityLockTopicLightbox.__super__.constructor.apply(this, arguments)
        }
        CommunityLockTopicLightbox.prototype.init = function() {
            var form;
            this.with_redactor(function(_this) {
                return function() {
                    return I.redactor(_this.el.find("textarea"), {
                        minHeight: 100,
                        source: false
                    })
                }
            }(this));
            return form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    form.set_form_errors(res.errors);
                    if (res.errors) {
                        return
                    }
                    return window.location.reload()
                }
            }(this))
        };
        return CommunityLockTopicLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    I.CommunityNewTopic = function() {
        function CommunityNewTopic(el, opts) {
            var form;
            this.el = $(el);
            try {
                this.el.find("input[name=offset]").val((new Date).getTimezoneOffset())
            } catch (error) {}
            this.set_fingerprint();
            form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    if (res.errors) {
                        if (I.add_recaptcha_if_necessary(form, res.errors)) {
                            return
                        }
                        form.set_form_errors(res.errors);
                        return
                    }
                    if (res.redirect_to) {
                        return window.location = res.redirect_to
                    }
                }
            }(this))
        }
        CommunityNewTopic.prototype.set_fingerprint = function() {
            if (!window.Fingerprint2) {
                return false
            }
            this.set_fingerprint = function() {};
            return (new Fingerprint2).get(function(_this) {
                return function(res) {
                    if (res) {
                        return _this.el.find("input[name=bfp]").val(res)
                    }
                }
            }(this))
        };
        return CommunityNewTopic
    }()
}).call(this);
(function() {
    I.CommunityPostForm = function() {
        function CommunityPostForm(el, opts) {
            var form;
            if (opts == null) {
                opts = {}
            }
            this.el = $(el);
            form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    if (res.errors) {
                        if (I.add_recaptcha_if_necessary(form, res.errors)) {
                            return
                        }
                        form.set_form_errors(res.errors);
                        return
                    }
                    if (res.redirect_to) {
                        window.location = res.redirect_to
                    }
                    if (res.flash) {
                        return I.flash(res.flash)
                    }
                }
            }(this))
        }
        return CommunityPostForm
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
    I.CommunityReportPostLightbox = function(superClass) {
        extend(CommunityReportPostLightbox, superClass);

        function CommunityReportPostLightbox() {
            this.init = bind(this.init, this);
            return CommunityReportPostLightbox.__super__.constructor.apply(this, arguments)
        }
        CommunityReportPostLightbox.prototype.init = function() {
            var form;
            return form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    if (res.errors) {
                        form.set_form_errors(res.errors);
                        return
                    }
                    return _this.el.addClass("submitted_report")
                }
            }(this))
        };
        return CommunityReportPostLightbox
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
    I.CommunityStickTopicLightbox = function(superClass) {
        extend(CommunityStickTopicLightbox, superClass);

        function CommunityStickTopicLightbox() {
            this.init = bind(this.init, this);
            return CommunityStickTopicLightbox.__super__.constructor.apply(this, arguments)
        }
        CommunityStickTopicLightbox.prototype.init = function() {
            var form;
            this.with_redactor(function(_this) {
                return function() {
                    return I.redactor(_this.el.find("textarea"), {
                        minHeight: 100,
                        source: false
                    })
                }
            }(this));
            return form = this.el.find("form").remote_submit(function(_this) {
                return function(res) {
                    form.set_form_errors(res.errors);
                    if (res.errors) {
                        return
                    }
                    return window.location.reload()
                }
            }(this))
        };
        return CommunityStickTopicLightbox
    }(I.Lightbox)
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.CommunityTopicHeader = function() {
        function CommunityTopicHeader(el, opts) {
            var moderation;
            this.opts = opts;
            this.render_topic_voter = bind(this.render_topic_voter, this);
            this.el = $(el);
            moderation = this.el.find(".moderation_tools");
            if (moderation.length) {
                new I.CommunityTopicModerationTools(moderation, this.opts.moderation)
            }
            this.render_topic_voter()
        }
        CommunityTopicHeader.prototype.render_topic_voter = function() {
            var props, ref, voter;
            if (!(typeof R !== "undefined" && R !== null ? (ref = R.Community) != null ? ref.TopicVoter : void 0 : void 0)) {
                return
            }
            voter = this.el.find(".community_topic_voter_widget");
            if (!voter.length) {
                return
            }
            props = voter.data("p");
            props.vote_url = this.opts.vote_url;
            return ReactDOM.render(R.Community.TopicVoter(props), voter[0])
        };
        return CommunityTopicHeader
    }()
}).call(this);
(function() {
    I.CommunityTopicList = function() {
        function CommunityTopicList(el, opts) {
            this.opts = opts;
            this.el = $(el);
            new I.CommunityTopicModerationTools(el, this.opts);
            this.el.lazy_images({
                selector: "[data-background_image]"
            });
            this.render_topic_voters();
            this.el.has_tooltips();
            new I.GamePopups(this.el)
        }
        CommunityTopicList.prototype.render_topic_voters = function() {
            var i, len, props, ref, ref1, results, voter;
            if (!(typeof R !== "undefined" && R !== null ? (ref = R.Community) != null ? ref.TopicVoter : void 0 : void 0)) {
                return
            }
            ref1 = this.el.find(".community_topic_voter_widget");
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                voter = ref1[i];
                props = $(voter).data("p");
                props.vote_url = this.opts.vote_url;
                results.push(ReactDOM.render(R.Community.TopicVoter(props), voter))
            }
            return results
        };
        return CommunityTopicList
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.CommunityTopicModerationTools = function() {
        CommunityTopicModerationTools.prototype.topic_url = function(route, topic_id) {
            return this.opts.urls[route].replace(/:topic_id\b/, topic_id)
        };

        function CommunityTopicModerationTools(el, opts) {
            this.opts = opts;
            this.topic_url = bind(this.topic_url, this);
            this.el = $(el);
            new I.FilterPickers(el);
            this.el.on("click", ".filter_option", function(_this) {
                return function(e) {
                    var target, topic_id, value;
                    target = $(e.currentTarget).trigger("i:close_filter_pickers");
                    topic_id = target.closest("[data-topic_id]").data("topic_id");
                    value = target != null ? target.data("value") : void 0;
                    switch (value) {
                        case "purge":
                            e.preventDefault();
                            if (confirm("This will delete all the users posts and spam their account. No undo. Are you sure?")) {
                                return $.post($(e.currentTarget).attr("href"), I.with_csrf()).done(function(res) {
                                    if (res.errors) {
                                        alert(res.errors.join(","));
                                        return
                                    }
                                    if (res.redirect_to) {
                                        return window.location = res.redirect_to
                                    }
                                })
                            }
                            break;
                        case "feature":
                        case "unfeature":
                        case "bump":
                            e.preventDefault();
                            return $.post($(e.currentTarget).attr("href"), I.with_csrf()).done(function(res) {
                                if (res.errors) {
                                    alert(res.errors.join(","));
                                    return
                                }
                                if (res.redirect_to) {
                                    return window.location = res.redirect_to
                                }
                            });
                        case "archive":
                        case "unarchive":
                            e.preventDefault();
                            return I.Lightbox.open_remote(_this.topic_url("archive_topic", topic_id), I.CommunityArchiveTopicLightbox);
                        case "lock":
                        case "unlock":
                            e.preventDefault();
                            return I.Lightbox.open_remote(_this.topic_url("lock_topic", topic_id), I.CommunityLockTopicLightbox);
                        case "stick":
                        case "unstick":
                            e.preventDefault();
                            return I.Lightbox.open_remote(_this.topic_url("stick_topic", topic_id), I.CommunityStickTopicLightbox);
                        case "delete":
                            e.preventDefault();
                            if (confirm("Are you sure you want to delete this topic?")) {
                                return $.ajax({
                                    url: _this.topic_url("delete_topic", topic_id),
                                    data: I.with_csrf(),
                                    type: "post",
                                    xhrFields: {
                                        withCredentials: true
                                    }
                                }).done(function(res) {
                                    if (res.errors) {
                                        return alert(res.errors.join())
                                    }
                                    return window.location.reload()
                                })
                            }
                    }
                }
            }(this))
        }
        return CommunityTopicModerationTools
    }()
}).call(this);
(function() {
    var bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments)
        }
    };
    I.CommunityViewTopic = function() {
        CommunityViewTopic.prototype.vote_counts_template = I.lazy_template(CommunityViewTopic, "vote_counts");

        function CommunityViewTopic(el, opts) {
            this.opts = opts;
            this.update_votes = bind(this.update_votes, this);
            this.el = $(el);
            this.el.remote_link(function(_this) {
                return function(res, el) {
                    if (el.is(".vote_btn")) {
                        if (res.errors) {
                            alert(res.errors.join(", "));
                            return
                        }
                        _this.update_votes(el, res);
                        return
                    }
                    if (res.redirect_to) {
                        return window.location = res.redirect_to
                    }
                }
            }(this));
            this.el.dispatch("click", {
                ban_user_btn: function(_this) {
                    return function(btn) {
                        var ban_url, post;
                        post = btn.closest(".community_post").data("post");
                        ban_url = _this.opts.ban_url + ("?banned_user_id=" + post.user_id);
                        return I.Lightbox.open_remote(ban_url, I.CommunityBanLightbox)
                    }
                }(this),
                stick_topic_btn: function(_this) {
                    return function(btn) {
                        return I.Lightbox.open_remote(btn.data("href"), I.CommunityStickTopicLightbox)
                    }
                }(this),
                lock_topic_btn: function(_this) {
                    return function(btn) {
                        return I.Lightbox.open_remote(btn.data("href"), I.CommunityLockTopicLightbox)
                    }
                }(this),
                report_post_btn: function(_this) {
                    return function(btn) {
                        var post, url;
                        post = btn.closest(".community_post").data("post");
                        url = _this.opts.report_url.replace(/:post_id/, post.id);
                        return I.Lightbox.open_remote(url, I.CommunityReportPostLightbox)
                    }
                }(this),
                embed_preload: function(_this) {
                    return function(btn) {
                        var code;
                        if (btn[0].hasAttribute("changio")) {
                            code = btn.data("embed_code");
                            return btn.replaceWith(code)
                        }
                    }
                }(this)
            })
        }
        CommunityViewTopic.prototype.update_votes = function(el, res) {
            var i, len, like_button, post, v, voters;
            post = el.closest(".community_post");
            voters = post.find(".vote_btn");
            like_button = voters.filter(".post_action");
            like_button.removeClass("animate_bounce animate_drop_down");
            setTimeout(function(_this) {
                return function() {
                    return like_button.removeClass("animate_bounce animate_drop_down")
                }
            }(this), 500);
            if (el.is(".voted")) {
                _.defer(function(_this) {
                    return function() {
                        return like_button.addClass("animate_drop_down")
                    }
                }(this));
                el.removeClass("voted")
            } else {
                _.defer(function(_this) {
                    return function() {
                        return like_button.addClass("animate_bounce")
                    }
                }(this));
                voters.removeClass("voted").filter(el).addClass("voted")
            }
            for (i = 0, len = voters.length; i < len; i++) {
                v = voters[i];
                v = $(v);
                if (v.is(".voted")) {
                    v.data("params").action = "remove"
                } else {
                    delete v.data("params").action
                }
            }
            return post.find(".vote_counts").html(this.vote_counts_template({
                up_score: res.up_score + Math.max(0, res.score_adjustment),
                down_score: res.down_score + Math.abs(Math.min(0, res.score_adjustment))
            }))
        };
        return CommunityViewTopic
    }()
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Index");
        types = PropTypes;
        P("LazyImage", {
            pure: true,
            propTypes: {
                src: types.string,
                src_set: types.string,
                width: types.number,
                height: types.number
            },
            getInitialState: function() {
                return {
                    visible: false
                }
            },
            componentDidMount: function() {
                var el;
                el = ReactDOM.findDOMNode(this);
                return this.unbind_lazy_images = $(el).lazy_images({
                    elements: [el],
                    show_images: function(_this) {
                        return function() {
                            var base;
                            _this.setState({
                                visible: true
                            });
                            return typeof(base = _this.props).on_reveal === "function" ? base.on_reveal() : void 0
                        }
                    }(this)
                })
            },
            componentWillUnmount: function() {
                return typeof this.unbind_lazy_images === "function" ? this.unbind_lazy_images() : void 0
            },
            render: function() {
                var ref, ref1;
                return img({
                    className: classNames(this.props["class"], this.props.className, {
                        lazy_loaded: this.state.loaded,
                        lazy_visible: this.state.visible
                    }),
                    alt: this.props.alt,
                    width: this.state.loaded ? this.props.width : (ref = this.props.initial_width) != null ? ref : this.props.width,
                    height: this.state.loaded ? this.props.height : (ref1 = this.props.initial_height) != null ? ref1 : this.props.height,
                    src: this.state.visible ? this.props.src : void 0,
                    srcSet: this.state.visible ? this.props.src_set : void 0,
                    onLoad: this.state.visible && !this.state.loaded ? function(_this) {
                        return function() {
                            var base;
                            _this.setState({
                                loaded: true
                            });
                            return typeof(base = _this.props).on_load === "function" ? base.on_load() : void 0
                        }
                    }(this) : void 0
                })
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Community");
        types = PropTypes;
        P("CategoryEditTags", {
            propTypes: {
                tags: types.arrayOf(types.shape({
                    id: types.number.isRequired,
                    label: types.string.isRequired,
                    color: types.string
                }))
            },
            getInitialState: function() {
                return {
                    tags: _.toArray(this.props.tags)
                }
            },
            push_tag: function(tag) {
                tag = $.trim(tag);
                if (tag === "") {
                    return
                }
                this.state.tags.push({
                    label: tag
                });
                return this.forceUpdate()
            },
            remove_tag: function(idx) {
                this.state.tags.splice(idx, 1);
                return this.forceUpdate()
            },
            input_name: function(name, idx) {
                return "category_tags[" + (idx + 1) + "][" + name + "]"
            },
            render: function() {
                return this.enclose({}, this.state.tags.length ? div({
                    className: "tag_list",
                    children: _.map(this.state.tags, function(_this) {
                        return function(tag, idx) {
                            return div({
                                className: "tag_row",
                                key: tag.id + "-" + tag.label
                            }, tag.id != null ? input({
                                type: "hidden",
                                name: _this.input_name("id", idx),
                                value: "" + tag.id
                            }) : void 0, tag.color != null ? input({
                                type: "hidden",
                                name: _this.input_name("color", idx),
                                value: tag.color
                            }) : void 0, input({
                                type: "hidden",
                                name: _this.input_name("label", idx),
                                value: tag.label
                            }), span({
                                className: "tag_label"
                            }, tag.label), " ", a({
                                href: "",
                                onClick: function(e) {
                                    e.preventDefault();
                                    return _this.remove_tag(idx)
                                }
                            }, "remove"))
                        }
                    }(this))
                }) : void 0, input({
                    type: "text",
                    placeholder: "Press enter to add tag",
                    onKeyDown: function(_this) {
                        return function(e) {
                            if (e.keyCode !== 13) {
                                return
                            }
                            e.preventDefault();
                            _this.push_tag(e.target.value);
                            return e.target.value = ""
                        }
                    }(this)
                }))
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, key_counter, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul, slice = [].slice;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Community");
        types = PropTypes;
        key_counter = 0;
        P("EditCategories", {
            propTypes: {
                category: types.object
            },
            getInitialState: function() {
                return {
                    children: _.toArray(this.props.category.children)
                }
            },
            componentDidMount: function() {
                return this.dispatch("category", {
                    create: function(_this) {
                        return function() {
                            _this.state.children.push({
                                key: key_counter += 1
                            });
                            return _this.forceUpdate()
                        }
                    }(this),
                    set_property: function(_this) {
                        return function(e, category, property, value) {
                            category[property] = value;
                            return _this.forceUpdate()
                        }
                    }(this),
                    create_child: function(_this) {
                        return function(e, category) {
                            category.children || (category.children = []);
                            category.children.push({
                                key: key_counter += 1
                            });
                            return _this.forceUpdate()
                        }
                    }(this),
                    remove_child: function(_this) {
                        return function(e, category, idx) {
                            var children;
                            children = category === _this.props.category ? _this.state.children : category.children;
                            children.splice(idx, 1);
                            return _this.forceUpdate()
                        }
                    }(this),
                    toggle: function(_this) {
                        return function(e, category, field) {
                            category[field] = !category[field];
                            return _this.forceUpdate()
                        }
                    }(this),
                    move_up: function(_this) {
                        return function(e, category, idx) {
                            var c, children, ref, swap_with;
                            children = category === _this.props.category ? _this.state.children : category.children;
                            swap_with = idx - 1;
                            if (!children[swap_with]) {
                                return
                            }
                            c = children;
                            ref = [c[swap_with], c[idx]], c[idx] = ref[0], c[swap_with] = ref[1];
                            return _this.forceUpdate()
                        }
                    }(this),
                    move_down: function(_this) {
                        return function(e, category, idx) {
                            var c, children, ref, swap_with;
                            children = category === _this.props.category ? _this.state.children : category.children;
                            swap_with = idx + 1;
                            if (!children[swap_with]) {
                                return
                            }
                            c = children;
                            ref = [c[swap_with], c[idx]], c[idx] = ref[0], c[swap_with] = ref[1];
                            return _this.forceUpdate()
                        }
                    }(this)
                })
            },
            render: function() {
                return form({
                    method: "POST",
                    className: "edit_categories form"
                }, R.CSRF({}), h2({}, "Subcategories"), this.state.children.length ? div({
                    className: "category_list",
                    children: _.map(this.state.children, function(_this) {
                        return function(cat, idx) {
                            return P.CategoryRow({
                                is_first: idx === 0,
                                is_last: idx === _this.state.children.length - 1,
                                key: cat.key || "cat" + cat.id,
                                parent_category: _this.props.category,
                                category: cat,
                                position: idx + 1
                            })
                        }
                    }(this))
                }) : p({}, em({
                    className: "empty_message"
                }, "There are no categories. You must have at least one non-directory category for your community to be usable.")), div({
                    className: "button_row"
                }, button({
                    className: "button",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("category:create")
                        }
                    }(this)
                }, "New category"), " ", button({
                    className: "button"
                }, "Save")))
            }
        });
        P("CategoryRow", {
            propTypes: {
                is_first: types.bool,
                is_last: types.bool,
                position: types.number,
                category: types.shape({
                    id: types.number,
                    title: types.string
                }),
                input_prefix: types.string
            },
            input_name: function(name) {
                var prefix;
                prefix = this.props.input_prefix || "categories";
                return prefix + "[" + (this.props.position || "") + "][" + name + "]"
            },
            render: function() {
                var count, ref;
                return div({
                    className: "category_row"
                }, this.props.category.id ? input({
                    type: "hidden",
                    name: this.input_name("id"),
                    value: this.props.category.id
                }) : void 0, div.apply(null, [{
                    className: "category_primary_inputs"
                }].concat(slice.call(this.render_title_inputs()))), div.apply(null, [{
                    className: "category_secondary_inputs"
                }].concat(slice.call(this.render_button_inputs()))), div({
                    className: "category_secondary_inputs"
                }, label({}, input({
                    type: "checkbox",
                    name: this.input_name("archived"),
                    checked: this.props.category.archived || false,
                    onChange: function(_this) {
                        return function(e) {
                            return _this.trigger("category:toggle", _this.props.category, "archived")
                        }
                    }(this)
                }), span({
                    className: "label"
                }, "Archive")), label({}, input({
                    type: "checkbox",
                    name: this.input_name("hidden"),
                    checked: this.props.category.hidden || false,
                    onChange: function(_this) {
                        return function(e) {
                            return _this.trigger("category:toggle", _this.props.category, "hidden")
                        }
                    }(this)
                }), span({
                    className: "label"
                }, "Hidden")), label({}, input({
                    type: "checkbox",
                    name: this.input_name("directory"),
                    checked: this.props.category.directory || false,
                    onChange: function(_this) {
                        return function(e) {
                            return _this.trigger("category:toggle", _this.props.category, "directory")
                        }
                    }(this)
                }), span({
                    className: "label"
                }, "Directory")), this.props.category.created_at ? span({
                    className: "created_at"
                }, moment.utc(this.props.category.created_at).local().calendar()) : void 0, !this.props.category.directory && this.props.category.topics_count != null ? (count = this.props.category.topics_count, span({
                    className: "topics_count"
                }, count + " topic" + (count === 1 && "" || "s"))) : void 0, this.props.category.url ? a({
                    className: "category_link",
                    href: this.props.category.url
                }, "View") : void 0, this.props.category.edit_url ? a({
                    className: "category_link",
                    href: this.props.category.edit_url
                }, "Edit") : void 0), ((ref = this.props.category.children) != null ? ref.length : void 0) ? div({
                    className: "child_categories",
                    children: _.map(this.props.category.children, function(_this) {
                        return function(cat, idx) {
                            return P.CategoryRow({
                                is_first: idx === 0,
                                is_last: idx === _this.props.category.children - 1,
                                key: cat.key || "cat" + cat.id,
                                input_prefix: (_this.props.input_prefix || "categories") + "[" + _this.props.position + "][children]",
                                parent_category: _this.props.category,
                                category: cat,
                                position: idx + 1
                            })
                        }
                    }(this))
                }) : void 0)
            },
            render_title_inputs: function() {
                return [!this.props.category.id ? span({
                    className: "new_flag"
                }, "New") : void 0, input({
                    type: "text",
                    className: "title_input text_input",
                    name: this.input_name("title"),
                    required: "required",
                    value: this.props.category.title || "",
                    placeholder: "Title",
                    onChange: function(_this) {
                        return function(e) {
                            return _this.trigger("category:set_property", _this.props.category, "title", e.target.value)
                        }
                    }(this)
                }), !this.props.category.directory ? input({
                    type: "text",
                    className: "short_description_input text_input",
                    name: this.input_name("short_description"),
                    value: this.props.category.short_description || "",
                    placeholder: "Short description",
                    onChange: function(_this) {
                        return function(e) {
                            return _this.trigger("category:set_property", _this.props.category, "short_description", e.target.value)
                        }
                    }(this)
                }) : void 0]
            },
            render_button_inputs: function() {
                return [button({
                    className: "button small",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("category:create_child", _this.props.category)
                        }
                    }(this)
                }, "Add child"), !this.props.is_first ? a({
                    href: "#",
                    className: "move_btn move_up_btn",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("category:move_up", _this.props.parent_category, _this.props.position - 1)
                        }
                    }(this)
                }, "Move up") : void 0, !this.props.is_last ? a({
                    href: "#",
                    className: "move_btn move_down_btn",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.trigger("category:move_down", _this.props.parent_category, _this.props.position - 1)
                        }
                    }(this)
                }, "Move down") : void 0, a({
                    href: "#",
                    className: "remove_btn",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            if (confirm("Are you sure you want to remove?")) {
                                return _this.trigger("category:remove_child", _this.props.parent_category, _this.props.position - 1)
                            }
                        }
                    }(this)
                }, "Remove")]
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul, hasProp = {}.hasOwnProperty,
            indexOf = [].indexOf || function(item) {
                for (var i = 0, l = this.length; i < l; i++) {
                    if (i in this && this[i] === item) return i
                }
                return -1
            };
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Community");
        types = PropTypes;
        P("PostLiker", {
            pure: true,
            getDefaultProps: function() {
                return {
                    animation_duration: 500
                }
            },
            componentDidCatch: function(error, info) {
                return I.event("error", "react", "Community.PostLiker")
            },
            componentWillUnmount: function() {
                if (this.animation_timer) {
                    window.clearTimeout(this.animation_timer);
                    return this.animation_timer = null
                }
            },
            componentDidUpdate: function(_, prev_state) {
                var ref1;
                if (((ref1 = this.state) != null ? ref1.animation : void 0) && (prev_state != null ? prev_state.animation : void 0) !== this.state.animation) {
                    return this.animation_timer = window.setTimeout(function(_this) {
                        return function() {
                            return _this.setState({
                                animation: null
                            })
                        }
                    }(this), this.props.animation_duration)
                }
            },
            like: function() {
                var animation, future_animation, params, ref1, ref2;
                params = {
                    direction: "up"
                };
                if ((ref1 = this.props.vote) != null ? ref1.positive : void 0) {
                    params.action = "remove"
                }
                animation = params.action === "remove" ? "animate_drop_down" : "animate_bounce";
                if ((ref2 = this.state) != null ? ref2.animation : void 0) {
                    future_animation = animation;
                    _.defer(function(_this) {
                        return function() {
                            return _this.setState({
                                animation: future_animation
                            })
                        }
                    }(this));
                    animation = null
                }
                this.setState({
                    loading: true,
                    pending_vote: params.action !== "remove",
                    animation: animation
                });
                return $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: this.props.urls.vote_url({
                        id: this.props.post_id
                    }),
                    data: I.with_csrf(params),
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(_this) {
                    return function(res) {
                        var base;
                        _this.setState({
                            loading: false,
                            pending_vote: void 0
                        });
                        return typeof(base = _this.props).on_vote === "function" ? base.on_vote(res) : void 0
                    }
                }(this)).error(function(_this) {
                    return function(xhr) {
                        var res;
                        _this.setState({
                            loading: false
                        });
                        res = function() {
                            try {
                                return JSON.parse(xhr.responseText)
                            } catch (error1) {}
                        }();
                        if (res != null ? res.errors : void 0) {
                            _this.setState({
                                pending_vote: null
                            })
                        }
                        if (res != null ? res.login_url : void 0) {
                            return window.location = res.login_url
                        }
                    }
                }(this))
            },
            render: function() {
                var ref1, ref2, ref3, ref4, ref5;
                if (!this.props.current_user) {
                    return this.enclose({
                        component: "a",
                        className: classNames("post_action vote_btn", this.props.classNames),
                        href: this.props.login_url,
                        target: "_blank"
                    }, R.Icons.TriUp, " ", this.tt("community.post_list.like"))
                }
                return this.enclose({
                    component: "button",
                    type: "button",
                    className: classNames("post_action vote_btn", (ref1 = this.state) != null ? ref1.animation : void 0, this.props.classNames, {
                        loading: (ref2 = this.state) != null ? ref2.loading : void 0,
                        voted: (ref3 = (ref4 = this.state) != null ? ref4.pending_vote : void 0) != null ? ref3 : (ref5 = this.props.vote) != null ? ref5.positive : void 0
                    }),
                    onClick: this.on_click || (this.on_click = function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.like()
                        }
                    }(this))
                }, R.Icons.TriUp, " ", this.tt("community.post_list.like"))
            }
        });
        P("PostVoter", {
            pure: true,
            propTypes: {
                urls: types.object,
                post_id: types.number,
                vote: types.object
            },
            componentDidCatch: function(error, info) {
                return I.event("error", "react", "Community.PostVoter")
            },
            vote: function(dir) {
                var params, ref1, ref2;
                if ((ref1 = this.state) != null ? ref1.loading : void 0) {
                    return
                }
                params = {
                    direction: dir
                };
                if (dir === "up" && ((ref2 = this.props.vote) != null ? ref2.positive : void 0)) {
                    params.action = "remove"
                }
                if (dir === "down" && this.props.vote && !this.props.vote.positive) {
                    params.action = "remove"
                }
                this.setState({
                    loading: true
                });
                return $.ajax({
                    type: "POST",
                    url: this.props.urls.vote_url({
                        id: this.props.post_id
                    }),
                    data: I.with_csrf(params),
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(_this) {
                    return function(res) {
                        var base;
                        _this.setState({
                            loading: false
                        });
                        return typeof(base = _this.props).on_vote === "function" ? base.on_vote(res) : void 0
                    }
                }(this)).error(function(_this) {
                    return function(xhr) {
                        var res;
                        _this.setState({
                            loading: false
                        });
                        res = function() {
                            try {
                                return JSON.parse(xhr.responseText)
                            } catch (error1) {}
                        }();
                        if (res != null ? res.login_url : void 0) {
                            return window.location = res.login_url
                        }
                    }
                }(this))
            },
            render: function() {
                var ref1;
                return this.enclose({
                    className: classNames("post_votes", {
                        loading: (ref1 = this.state) != null ? ref1.loading : void 0
                    })
                }, this.props.current_user ? button({
                    type: "button",
                    disabled: this.props.disabled,
                    className: classNames("vote_up_btn vote_btn", {
                        voted: this.props.vote && this.props.vote.positive
                    }),
                    onClick: this.on_vote_up || (this.on_vote_up = function(_this) {
                        return function() {
                            return _this.vote("up")
                        }
                    }(this))
                }, R.Icons.TriUp) : a({
                    className: "vote_up_btn vote_btn",
                    target: "_blank",
                    rel: "nofollow",
                    href: this.props.login_url
                }, R.Icons.TriUp), this.props.current_user ? button({
                    type: "button",
                    disabled: this.props.disabled,
                    className: classNames("vote_down_btn vote_btn", {
                        voted: this.props.vote && !this.props.vote.positive
                    }),
                    onClick: this.on_vote_down || (this.on_vote_down = function(_this) {
                        return function() {
                            return _this.vote("down")
                        }
                    }(this))
                }, R.Icons.TriDown) : a({
                    className: "vote_down_btn vote_btn",
                    target: "_blank",
                    rel: "nofollow",
                    href: this.props.login_url
                }, R.Icons.TriDown))
            }
        });
        P("PostBody", {
            pure: true,
            getDefaultProps: function() {
                return {
                    max_height: 300
                }
            },
            componentDidMount: function() {
                return _.defer(function(_this) {
                    return function() {
                        var buffer, images;
                        images = $(_this.wrapper_ref.current).find("img").on("load", function() {
                            return _this.refresh_sizes()
                        });
                        buffer = !images.length ? 50 : void 0;
                        return _this.refresh_sizes(buffer)
                    }
                }(this))
            },
            reveal: function() {
                return this.setState({
                    open: true,
                    has_more: false
                })
            },
            on_click: function(e) {
                var embed, ref1, ref2;
                if ((ref1 = this.state) != null ? ref1.has_more : void 0) {
                    this.reveal()
                }
                embed = $(e.target).closest(".embed_preload");
                if (embed.length) {
                    code = embed.data("embed_code");
                    embed.replaceWith(code);
                    if (!((ref2 = this.state) != null ? ref2.open : void 0)) {
                        return this.setState({
                            open: true
                        })
                    }
                }
            },
            refresh_sizes: function(buffer) {
                var total_height;
                if (!this.wrapper_ref.current) {
                    return
                }
                total_height = this.wrapper_ref.current.scrollHeight;
                if (total_height > this.props.max_height) {
                    this.setState({
                        has_more: true
                    })
                }
                if (buffer) {
                    if (total_height < this.props.max_height + buffer) {
                        return this.setState({
                            open: true,
                            has_more: false
                        })
                    }
                }
            },
            render: function() {
                var ref1, ref2, style;
                style = !((ref1 = this.state) != null ? ref1.open : void 0) ? {
                    overflowY: "hidden",
                    maxHeight: this.props.max_height + "px"
                } : void 0;
                return fragment({}, div({
                    className: "post_body user_formatted",
                    ref: this.wrapper_ref || (this.wrapper_ref = React.createRef()),
                    style: style,
                    onClick: this.on_click,
                    dangerouslySetInnerHTML: {
                        __html: this.props.body_html
                    }
                }), ((ref2 = this.state) != null ? ref2.has_more : void 0) ? button({
                    type: "button",
                    onClick: this.reveal,
                    className: "reveal_full_post_btn"
                }, "View rest ↓") : void 0)
            }
        });
        P("Post", {
            pure: true,
            edit_post: function(update) {
                return this.props.edit_post(this.props.post, update)
            },
            is_redacted: function() {
                var post, ref1, ref2, ref3, user;
                post = this.props.post;
                user = this.props.post.user;
                if (post.deleted || ((ref1 = post.user) != null ? ref1.deleted : void 0)) {
                    return true
                } else if (((ref2 = post.user) != null ? ref2.suspended : void 0) || post.blocked) {
                    return !((ref3 = this.state) != null ? ref3.show_blocked : void 0)
                } else {
                    return false
                }
            },
            render: function() {
                var post, ref1;
                post = this.props.post;
                return fragment({}, this.render_current_post(), ((ref1 = post.replies) != null ? ref1.length : void 0) ? this.render_children() : post.view_replies_url ? div({
                    className: "view_more_replies"
                }, a({
                    href: post.view_replies_url,
                    className: "button outline forward_link"
                }, this.tt("community.post_list.view_more_in_thread"))) : void 0)
            },
            render_children: function() {
                var post;
                post = this.props.post;
                return div({
                    className: classNames("community_post_replies", {
                        top_level_replies: post.depth === 1
                    })
                }, post.replies.map(function(_this) {
                    return function(post, idx) {
                        return P.Post({
                            key: post.id,
                            readonly: _this.props.readonly,
                            idx: idx,
                            post: post,
                            current_user: _this.props.current_user,
                            edit_post: _this.edit_child_post || (_this.edit_child_post = function(post, update) {
                                var _post;
                                return _this.edit_post({
                                    replies: function() {
                                        var i, len, ref1, results;
                                        ref1 = this.props.post.replies;
                                        results = [];
                                        for (i = 0, len = ref1.length; i < len; i++) {
                                            _post = ref1[i];
                                            if (_post === post) {
                                                if (update === "remove") {
                                                    continue
                                                }
                                                results.push($.extend({}, post, update))
                                            } else {
                                                results.push(_post)
                                            }
                                        }
                                        return results
                                    }.call(_this)
                                })
                            }),
                            urls: _this.props.urls,
                            reply_form_params: _this.props.reply_form_params
                        })
                    }
                }(this)))
            },
            update_vote: function(vote) {
                var down_adjust, score_adjustment, up_adjust;
                score_adjustment = vote.score_adjustment || 0;
                up_adjust = Math.max(score_adjustment, 0);
                down_adjust = Math.min(score_adjustment, 0);
                return this.edit_post({
                    up_votes: vote.up_score + up_adjust,
                    down_votes: vote.down_score - down_adjust,
                    vote: vote.score_adjustment ? {
                        positive: vote.score_adjustment > 0
                    } : null
                })
            },
            delete_post: function(type) {
                var delete_url, msg, params, post, ref1;
                if (type == null) {
                    type = null
                }
                post = this.props.post;
                msg = type === "hard" ? "Purging post will delete it permanently, along with any replies. Continue?" : "Are you sure you want to delete this post?";
                if (!confirm(msg)) {
                    return
                }
                if ((ref1 = this.state) != null ? ref1.deleting : void 0) {
                    return
                }
                this.setState({
                    deleting: true
                });
                delete_url = this.props.urls.delete_url({
                    id: post.id
                });
                params = {};
                if (type === "hard") {
                    params.hard = "1"
                }
                return $.ajax({
                    type: "POST",
                    url: delete_url,
                    data: I.with_csrf(params),
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(_this) {
                    return function(res) {
                        return _this.edit_post({
                            deleted: true,
                            hard_deleted: res.type === "hard"
                        })
                    }
                }(this)).always(function(_this) {
                    return function() {
                        return _this.setState({
                            deleting: false
                        })
                    }
                }(this))
            },
            render_current_post_moderation_event: function() {
                var moderation_event, post, user;
                post = this.props.post;
                user = this.props.post.user;
                moderation_event = post.moderation_event;
                if (post.deleted) {
                    return div({
                        className: "post_content"
                    }, div({
                        className: "post_body"
                    }, em({
                        className: "deleted_message"
                    }, this.tt("community.post_list.deleted_post"))))
                }
                return fragment({}, span({
                    className: "post_author"
                }, user.url && user.name ? a({
                    href: user.url
                }, user.name) : span({
                    className: "name_placeholder"
                }, "Unknown account")), span({
                    className: "moderation_action"
                }, strong({}, moderation_event.action), moderation_event.target_name ? fragment({}, " ", a({
                    href: moderation_event.target_url
                }, moderation_event.target_name)) : void 0, " ", span({
                    className: "post_date",
                    title: post.created_at + " UTC"
                }, a({
                    href: post.url
                }, "" + moment.utc(post.created_at).local().fromNow())), post.can_delete && !post.deleted && !this.props.readonly ? button({
                    className: "textlike delete_post_btn post_action",
                    type: "button",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.delete_post()
                        }
                    }(this)
                }, this.tt("community.post_list.delete")) : void 0))
            },
            render_current_post_contents: function() {
                var avatar, base, base1, base2, post, ref1, ref2, ref3, ref4, ref5, ref6, ref7, user;
                post = this.props.post;
                user = this.props.post.user;
                avatar = R.Index.LazyImage({
                    className: "post_avatar",
                    width: 25,
                    height: 25,
                    src: user.avatar_url,
                    src_set: user.avatar_url2x ? user.avatar_url + " 1x, " + user.avatar_url2x + " 2x" : void 0
                });
                return (post.just_added ? R.SlideDown : div)({
                    className: "post_grid"
                }, post.vote_types === "ud" ? P.PostVoter({
                    post_id: post.id,
                    vote: post.vote,
                    disabled: this.is_redacted(),
                    urls: this.props.urls,
                    on_vote: this.update_vote,
                    current_user: this.props.current_user,
                    login_url: typeof(base = this.props.urls).login_url === "function" ? base.login_url() : void 0
                }) : void 0, user.url ? a({
                    href: user.url,
                    className: "avatar_container"
                }, avatar) : div({
                    className: "avatar_container"
                }, avatar), div({
                    className: "post_header"
                }, span({
                    className: "post_author"
                }, post.deleted ? span({
                    className: "name_placeholder"
                }, "Deleted post") : user.deleted ? span({
                    className: "name_placeholder"
                }, this.tt("community.post_list.deleted_account")) : post.blocked && !((ref1 = this.state) != null ? ref1.show_blocked : void 0) ? span({
                    className: "name_placeholder"
                }, "Blocked account") : user.suspended ? span({
                    className: "name_placeholder"
                }, this.tt("community.post_list.suspended_account")) : user.url && user.name ? a({
                    href: user.url
                }, user.name) : void 0), span({
                    className: "post_date",
                    title: post.created_at + " UTC"
                }, a({
                    href: post.url
                }, "" + moment.utc(post.created_at).local().fromNow())), !this.is_redacted() && (post.edits_count || 0) > 0 ? fragment({}, " ", span({
                    className: "edit_message",
                    title: post.edited_at + " (" + post.edits_count + ")"
                }, this.tt("community.post_list.edited"))) : void 0, !this.is_redacted() && post.vote_types && (post.up_votes || post.down_votes) ? span({
                    className: "vote_counts"
                }, post.up_votes ? span({
                    className: "upvotes"
                }, "(+" + post.up_votes + ")") : void 0, post.down_votes ? span({
                    className: "downvotes"
                }, "(-" + post.down_votes + ")") : void 0) : void 0), div({
                    className: "post_content"
                }, post.deleted || ((ref2 = post.user) != null ? ref2.deleted : void 0) ? div({
                    className: "post_body"
                }, em({
                    className: "deleted_message"
                }, this.tt("community.post_list.deleted_post")), (post.can_moderate || post.admin_url) && !post.hard_deleted ? fragment({}, " (", button({
                    className: "textlike",
                    onClick: this.purge_post || (this.purge_post = function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.delete_post("hard").done(function() {
                                return _this.edit_post("remove")
                            })
                        }
                    }(this))
                }, "Purge"), ")") : void 0) : ((ref3 = post.user) != null ? ref3.suspended : void 0) && !((ref4 = this.state) != null ? ref4.show_blocked : void 0) ? div({
                    className: "post_body"
                }, em({}, this.tt("community.post_list.post_from_suspended_account")), " (", button({
                    className: "textlike",
                    onClick: this.show_blocked_post || (this.show_blocked_post = function(_this) {
                        return function() {
                            return _this.setState({
                                show_blocked: true
                            })
                        }
                    }(this))
                }, "Show post"), ")") : post.blocked && !((ref5 = this.state) != null ? ref5.show_blocked : void 0) ? div({
                    className: "post_body"
                }, em({}, this.tt("community.post_list.post_from_blocked_account")), " (", button({
                    className: "textlike",
                    onClick: this.show_blocked_post || (this.show_blocked_post = function(_this) {
                        return function() {
                            return _this.setState({
                                show_blocked: true
                            })
                        }
                    }(this))
                }, "Show post"), ", ", a({
                    href: this.props.urls.blocks_url(),
                    target: "_blank"
                }, this.tt("community.post_list.edit_blocks")), ")") : ((ref6 = this.state) != null ? ref6.editing : void 0) ? this.render_edit_form() : P.PostBody({
                    key: post.body_html,
                    body_html: post.body_html
                }), div({
                    className: "post_footer"
                }, !this.is_redacted() ? post.vote_types === "u" ? P.PostLiker({
                    post_id: post.id,
                    vote: post.vote,
                    urls: this.props.urls,
                    on_vote: this.update_vote,
                    current_user: this.props.current_user,
                    login_url: typeof(base1 = this.props.urls).login_url === "function" ? base1.login_url() : void 0
                }) : void 0 : void 0, !this.is_redacted() && !this.props.readonly ? post.can_reply ? a({
                    href: this.props.urls.reply_url({
                        id: post.id
                    }),
                    className: "post_action reply_btn",
                    onClick: this.props.reply_form_params ? this.on_click_reply || (this.on_click_reply = function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.setState(function(s) {
                                if (s == null) {
                                    s = {}
                                }
                                return {
                                    replying_to: !s.replying_to
                                }
                            })
                        }
                    }(this)) : void 0
                }, this.tt("community.post_list.reply")) : !this.props.current_user && this.props.urls.login_url ? a({
                    href: typeof(base2 = this.props.urls).login_url === "function" ? base2.login_url() : void 0,
                    className: "post_action reply_btn",
                    rel: "nofollow",
                    target: "_blank"
                }, this.tt("community.post_list.reply")) : void 0 : void 0, post.can_edit && !this.props.readonly ? a({
                    href: this.props.urls.edit_url({
                        id: post.id
                    }),
                    className: "post_action",
                    onClick: this.props.reply_form_params ? this.on_click_edit || (this.on_click_edit = function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.setState(function(s) {
                                if (s == null) {
                                    s = {}
                                }
                                return {
                                    editing: !s.editing,
                                    replying_to: false
                                }
                            })
                        }
                    }(this)) : void 0
                }, this.tt("community.post_list.edit")) : void 0, post.can_delete && !post.deleted && !this.props.readonly ? a({
                    href: "#",
                    className: "post_action delete_post_btn",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.delete_post()
                        }
                    }(this)
                }, post.is_topic ? this.tt("community.post_list.delete_topic") : this.tt("community.post_list.delete")) : void 0, !this.is_redacted() && post.can_report ? a({
                    href: "#",
                    className: "post_action render_post_btn",
                    onClick: function(_this) {
                        return function(e) {
                            var report_url;
                            e.preventDefault();
                            report_url = _this.props.urls.report_url({
                                id: post.id
                            });
                            return I.Lightbox.open_remote(report_url, I.CommunityReportPostLightbox)
                        }
                    }(this)
                }, this.tt("community.post_list.report")) : void 0, user.id && post.ban_target && !this.props.readonly ? a({
                    href: "#",
                    className: "post_action ban_user_btn",
                    onClick: function(_this) {
                        return function(e) {
                            var ban_url;
                            e.preventDefault();
                            ban_url = _this.props.urls.ban_url(post.ban_target);
                            ban_url += "?banned_user_id=" + user.id;
                            return I.Lightbox.open_remote(ban_url, I.CommunityBanLightbox)
                        }
                    }(this)
                }, strong({}, this.tt("community.post_list.ban"))) : void 0, post.admin_url ? a({
                    href: post.admin_url
                }, "Admin") : void 0), ((ref7 = this.state) != null ? ref7.replying_to : void 0) ? this.render_reply_form() : void 0))
            },
            render_edit_form: function() {
                var post;
                post = this.props.post;
                this.edit_form_cancel || (this.edit_form_cancel = fragment({}, " ", button({
                    type: "button",
                    className: "textlike",
                    onClick: function(_this) {
                        return function() {
                            return _this.setState({
                                editing: false
                            })
                        }
                    }(this)
                }, "Cancel")));
                return P.PostEditForm({
                    edit_url: this.props.urls.edit_url({
                        id: post.id
                    }),
                    more_buttons: this.edit_form_cancel,
                    reply_form_params: this.props.reply_form_params,
                    on_create_post: function(_this) {
                        return function(post) {
                            _this.edit_post(post);
                            return _this.setState({
                                editing: false
                            })
                        }
                    }(this)
                })
            },
            render_reply_form: function() {
                var ref1;
                return R.SlideDown({}, P.PostForm($.extend({
                    submit_url: this.props.urls.reply_url({
                        id: this.props.post.id
                    }),
                    autofocus: true,
                    open: true,
                    className: "inline_reply",
                    key: "post-" + (((ref1 = this.state) != null ? ref1.post_counter : void 0) || 0),
                    post_label: this.tt("community.post_form.post_reply"),
                    remember_key: "reply:" + this.props.post.id,
                    on_create_post: this.on_add_reply || (this.on_add_reply = function(_this) {
                        return function(post) {
                            post.just_added = true;
                            _this.setState(function(s) {
                                return {
                                    replying_to: false,
                                    post_counter: (s.post_counter || 0) + 1
                                }
                            });
                            return _this.edit_post({
                                replies: [post].concat(_this.props.post.replies || [])
                            })
                        }
                    }(this))
                }, this.props.reply_form_params)))
            },
            render_current_post: function() {
                var post, ref1, ref2, ref3;
                post = this.props.post;
                return this.enclose({
                    className: classNames("community_post", {
                        disabled: post.deleted || ((ref1 = post.user) != null ? ref1.suspended : void 0) || ((ref2 = post.user) != null ? ref2.deleted : void 0) || post.blocked,
                        is_deleted: post.deleted,
                        is_reply: post.depth > 1,
                        is_blocked: post.blocked,
                        is_suspended: (ref3 = post.user) != null ? ref3.suspended : void 0,
                        has_replies: post.replies && post.replies.length,
                        has_vote_column: post.vote_types === "ud",
                        moderation_event: post.moderation_event
                    }),
                    id: "post-" + post.id
                }, this.props.len_posts && this.props.idx === 0 ? div({
                    className: "post_anchor",
                    id: "first-post"
                }) : void 0, this.props.len_posts && this.props.idx === this.props.len_posts - 1 ? div({
                    className: "post_anchor",
                    id: "last-post"
                }) : void 0, post.moderation_event ? this.render_current_post_moderation_event() : this.render_current_post_contents())
            }
        });
        P("PostList", {
            pure: true,
            propTypes: {
                children: types.array,
                urls: types.object
            },
            componentDidCatch: function(error, info) {
                I.event("error", "react", "Community.PostList");
                return this.setState({
                    critical_error: true
                })
            },
            render: function() {
                var ref1;
                if ((ref1 = this.state) != null ? ref1.critical_error : void 0) {
                    return h3({}, "There was an error rendering the comments, please ", a({
                        href: "about:blank"
                    }, "contact support"), " with a link to this page.")
                }
                if (!this.props.posts) {
                    return null
                }
                this.url_templates || (this.url_templates = function(_this) {
                    return function() {
                        var k, out, ref2, v;
                        out = {};
                        ref2 = _this.props.urls;
                        for (k in ref2) {
                            if (!hasProp.call(ref2, k)) continue;
                            v = ref2[k];
                            out[k] = _.template(v)
                        }
                        return out
                    }
                }(this)());
                return this.enclose({}, this.props.posts.map(function(_this) {
                    return function(post, idx) {
                        var ref;
                        ref = idx === 0 ? _this.first_post_ref || (_this.first_post_ref = React.createRef()) : void 0;
                        return P.Post({
                            ref: ref,
                            key: post.id,
                            readonly: _this.props.readonly,
                            idx: idx,
                            edit_post: _this.props.edit_post,
                            len_posts: _this.props.posts.length,
                            post: post,
                            current_user: _this.props.current_user,
                            urls: _this.url_templates,
                            reply_form_params: _this.props.reply_form_params
                        })
                    }
                }(this)))
            }
        });
        P("LoadOnScroll", {
            componentWillUnmount: function() {
                return typeof this.unbind_visibility === "function" ? this.unbind_visibility() : void 0
            },
            componentDidMount: function() {
                var el;
                el = ReactDOM.findDOMNode(this);
                return this.unbind_visibility = $(el).lazy_images({
                    elements: [el],
                    show_images: function(_this) {
                        return function() {
                            var ref1;
                            return (ref1 = _this.props) != null ? ref1.on_seen() : void 0
                        }
                    }(this)
                })
            },
            render: function() {
                return this.props.children
            }
        });
        P("PostEditForm", {
            propTypes: {
                edit_url: types.string.isRequired
            },
            componentDidCatch: function(error, info) {
                I.event("error", "react", "Community.PostEditForm");
                return this.setState({
                    critical_error: true
                })
            },
            getInitialState: function() {
                return {
                    loading: true
                }
            },
            componentDidMount: function() {
                return $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: this.props.edit_url,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(_this) {
                    return function(res) {
                        return _this.setState({
                            loading: false,
                            errors: res.errors,
                            body_format: res.body_format,
                            body: res.body
                        })
                    }
                }(this))
            },
            render: function() {
                var ref1;
                if ((ref1 = this.state) != null ? ref1.critical_error : void 0) {
                    return h3({}, "There was an error editing this post, please ", a({
                        href: "about:blank"
                    }, "contact support"), " with a link to this page.")
                }
                if (this.state.body) {
                    return P.PostForm($.extend({}, this.props.reply_form_params, {
                        submit_url: this.props.edit_url,
                        autofocus: true,
                        open: true,
                        className: "inline_edit",
                        defaultValue: this.state.body,
                        body_format: this.state.body_format,
                        post_label: this.tt("misc.forms.save"),
                        more_buttons: this.props.more_buttons,
                        on_create_post: this.props.on_create_post
                    }))
                } else {
                    return div({}, "")
                }
            }
        });
        P("PostForm", {
            getInitialState: function() {
                return {
                    open: this.props.open || false
                }
            },
            componentDidCatch: function(error, info) {
                return I.event("error", "react", "Community.PostForm")
            },
            render: function() {
                return this.enclose({}, this.state.open ? this.render_form() : this.render_pre_form())
            },
            render_pre_form: function() {
                return form({
                    className: classNames("form post_form", this.props.className)
                }, input({
                    className: "click_input",
                    type: "text",
                    placeholder: this.t("game.comments.write_your_comment"),
                    onFocus: function(_this) {
                        return function() {
                            return _this.setState({
                                open: true,
                                focus: true
                            })
                        }
                    }(this)
                }))
            },
            render_form: function() {
                var ref1, ref2, ref3;
                return form({
                    action: this.props.submit_url,
                    ref: this.form_ref || (this.form_ref = React.createRef()),
                    className: classNames("form post_form", this.props.className),
                    onSubmit: function(_this) {
                        return function(e) {
                            var ref1;
                            if ((ref1 = _this.state) != null ? ref1.loading : void 0) {
                                return
                            }
                            e.preventDefault();
                            _this.setState({
                                loading: true
                            });
                            return I.remote_submit($(e.target), [{
                                name: "format",
                                value: "props"
                            }]).done(function(res) {
                                var base, ref2;
                                if (res.errors) {
                                    _this.setState({
                                        needs_recaptcha: indexOf.call(res.errors, "recaptcha") >= 0,
                                        errors: res.errors,
                                        loading: false
                                    });
                                    return
                                }
                                if (res.flash) {
                                    I.flash(res.flash)
                                }
                                if ((ref2 = _this.body_input_ref.current) != null) {
                                    ref2.clear_memory()
                                }
                                _this.setState({
                                    loading: false,
                                    needs_recaptcha: false,
                                    errors: null
                                });
                                if (res.post) {
                                    return typeof(base = _this.props).on_create_post === "function" ? base.on_create_post(res.post) : void 0
                                }
                            })
                        }
                    }(this)
                }, ((ref1 = this.state) != null ? ref1.errors : void 0) ? R.Forms.FormErrors({
                    errors: this.state.errors
                }) : void 0, R.CSRF({}), this.props.body_format ? input({
                    type: "hidden",
                    name: "post[body_format]",
                    value: this.props.body_format
                }) : void 0, function() {
                    switch (this.props.body_format || "html") {
                        case "html":
                            return R.Redactor({
                                placeholder: "Required",
                                ref: this.body_input_ref || (this.body_input_ref = React.createRef()),
                                remember_key: this.props.remember_key,
                                name: "post[body]",
                                required: true,
                                defaultValue: this.props.defaultValue,
                                redactor_opts: $.extend({
                                    minHeight: 50,
                                    focus: this.props.autofocus || this.state.focus
                                }, this.props.redactor_opts)
                            });
                        case "markdown":
                            return R.Forms.MarkdownInput({
                                ref: this.body_input_ref || (this.body_input_ref = React.createRef()),
                                remember_key: this.props.remember_key,
                                placeholder: "Required",
                                defaultValue: this.props.defaultValue,
                                name: "post[body]",
                                autofocus: this.props.autofocus || this.state.focus,
                                required: true,
                                on_submit_hotkey: this.on_submit_hotkey_callback || (this.on_submit_hotkey_callback = function(_this) {
                                    return function() {
                                        var ref2, ref3;
                                        return (ref2 = _this.submit_button_ref) != null ? (ref3 = ref2.current) != null ? ref3.click() : void 0 : void 0
                                    }
                                }(this))
                            });
                        default:
                            return R.Forms.FormErrors({
                                errors: ["Don't know how to edit post with format " + this.state.body_format]
                            })
                    }
                }.call(this), ((ref2 = this.state) != null ? ref2.needs_recaptcha : void 0) ? R.Forms.RecaptchaInput({
                    sitekey: this.props.recaptcha_sitekey
                }) : void 0, div({
                    className: "buttons"
                }, button({
                    className: "button",
                    disabled: (ref3 = this.state) != null ? ref3.loading : void 0,
                    ref: this.submit_button_ref || (this.submit_button_ref = React.createRef())
                }, this.props.post_label || this.tt("community.post_form.post")), this.props.more_buttons))
            }
        });
        R["package"]("Game")("Comments", {
            pure: true,
            getDefaultProps: function() {
                return {
                    autoload_count: 1
                }
            },
            getInitialState: function() {
                return {
                    posts: this.props.posts,
                    pagination: this.props.pagination,
                    autoload_count: this.props.autoload_count
                }
            },
            create_scroll_restore: function(el) {
                var from_top, offset_parent, scroll_top;
                el = $(el).find(".post_grid");
                if (!el.length) {
                    return function() {}
                }
                offset_parent = el.offsetParent();
                scroll_top = window.document.documentElement.scrollTop;
                from_top = el.position().top - scroll_top;
                return function() {
                    return window.document.documentElement.scrollTop = el.position().top - from_top
                }
            },
            load_page: function(page) {
                var ref1;
                if (page == null) {
                    page = "next_page"
                }
                if (!((ref1 = this.state.pagination) != null ? ref1[page] : void 0)) {
                    return
                }
                this.setState({
                    loading: true
                });
                return $.getJSON(this.props.topic.url, this.state.pagination[page]).done(function(_this) {
                    return function(res) {
                        var el, first_post, pagination, post_list, posts, ref2, ref3, ref4, restore_position;
                        if (res.posts) {
                            pagination = Object.assign({}, _this.props.pagination);
                            pagination[page] = (ref2 = res.pagination) != null ? ref2[page] : void 0;
                            posts = function() {
                                switch (page) {
                                    case "prev_page":
                                        return res.posts.concat(this.state.posts);
                                    case "next_page":
                                        return this.state.posts.concat(res.posts)
                                }
                            }.call(_this);
                            restore_position = page === "prev_page" ? (post_list = (ref3 = _this.post_list_ref) != null ? ref3.current : void 0, (first_post = post_list != null ? (ref4 = post_list.first_post_ref) != null ? ref4.current : void 0 : void 0) ? (el = ReactDOM.findDOMNode(first_post), _this.create_scroll_restore(el)) : void 0) : void 0;
                            return _this.setState({
                                loading: false,
                                posts: posts,
                                pagination: pagination
                            }, restore_position)
                        } else {
                            return _this.setState({
                                loading: false,
                                pagination: null
                            })
                        }
                    }
                }(this))
            },
            render: function() {
                var load_more_button, ref1, ref2, ref3, ref4;
                return this.enclose({}, h2({}, this.tt("game.comments.comments_header")), P.PostForm({
                    key: "post-" + (((ref1 = this.state) != null ? ref1.post_counter : void 0) || 0),
                    submit_url: this.props.post_form.submit_url,
                    post_label: this.tt("game.comments.post_comment"),
                    recaptcha_sitekey: this.props.recaptcha_sitekey,
                    remember_key: this.props.remember_key || "topic:" + this.props.topic.id,
                    redactor_opts: this.props.post_form.redactor_opts,
                    body_format: this.props.body_format,
                    on_create_post: this.on_create_post || (this.on_create_post = function(_this) {
                        return function(post) {
                            return _this.setState(function(s) {
                                post.just_added = true;
                                return {
                                    post_counter: (s.post_counter || 0) + 1,
                                    posts: [post].concat(s.posts || [])
                                }
                            })
                        }
                    }(this))
                }), this.state.pagination && this.state.pagination.prev_page ? p({
                    className: "pagination_buttons"
                }, a({
                    href: this.props.topic.url + "?" + $.param(this.state.pagination.prev_page),
                    className: "load_posts_before",
                    disabled: (ref2 = this.state) != null ? ref2.loading : void 0,
                    onClick: this.load_prev_page || (this.load_prev_page = function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return _this.load_page("prev_page")
                        }
                    }(this))
                }, "Show previous posts ↑")) : void 0, P.PostList({
                    ref: this.post_list_ref || (this.post_list_ref = React.createRef()),
                    posts: this.state.posts,
                    urls: this.props.urls,
                    current_user: this.props.current_user || I.current_user,
                    reply_form_params: this.reply_form_params || (this.reply_form_params = {
                        recaptcha_sitekey: this.props.recaptcha_sitekey,
                        redactor_opts: this.props.post_form.redactor_opts,
                        body_format: this.props.body_format
                    }),
                    edit_post: this.edit_post || (this.edit_post = function(_this) {
                        return function(post, update) {
                            return _this.setState(function(s) {
                                var _post;
                                return {
                                    posts: function() {
                                        var i, len, ref3, results;
                                        ref3 = s.posts;
                                        results = [];
                                        for (i = 0, len = ref3.length; i < len; i++) {
                                            _post = ref3[i];
                                            if (_post === post) {
                                                if (update === "remove") {
                                                    continue
                                                }
                                                results.push($.extend({}, post, update))
                                            } else {
                                                results.push(_post)
                                            }
                                        }
                                        return results
                                    }()
                                }
                            })
                        }
                    }(this))
                }), this.state.pagination && this.state.pagination.next_page ? (load_more_button = div({
                    className: "pagination_buttons"
                }, a({
                    href: this.props.topic.url + "?" + $.param(this.state.pagination.next_page),
                    className: classNames("load_posts_after", {
                        loading: (ref3 = this.state) != null ? ref3.loading : void 0
                    }),
                    onClick: this.load_next_page || (this.load_next_page = function(_this) {
                        return function(e) {
                            var ref4;
                            e.preventDefault();
                            if ((ref4 = _this.state) != null ? ref4.loading : void 0) {
                                return
                            }
                            return _this.load_page("next_page")
                        }
                    }(this))
                }, ((ref4 = this.state) != null ? ref4.loading : void 0) ? "Loading..." : "Load more")), this.state.autoload_count > 0 ? P.LoadOnScroll({
                    key: JSON.stringify(this.state.pagination),
                    on_seen: function(_this) {
                        return function() {
                            _this.setState(function(state) {
                                return {
                                    autoload_count: state.autoload_count - 1
                                }
                            });
                            return _this.load_page("next_page")
                        }
                    }(this)
                }, load_more_button) : load_more_button) : void 0)
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Community");
        types = PropTypes;
        P("TopicVoter", {
            propTypes: {
                post_id: types.number.isRequired,
                vote: types.string,
                vote_url: types.string.isRequired,
                score: types.number.isRequired,
                adjustment: types.number,
                dir: types.string
            },
            getInitialState: function() {
                return {
                    vote: this.props.vote
                }
            },
            vote: function(direction) {
                var opts, removing, url;
                if (!I.current_user) {
                    window.location = this.login_url();
                    return
                }
                this.setState({
                    loading: true
                });
                url = _.template(this.props.vote_url)({
                    post_id: this.props.post_id
                });
                removing = false;
                opts = direction === this.state.vote ? (removing = true, {
                    action: "remove"
                }) : {
                    direction: direction
                };
                return $.post(url, I.with_csrf(opts)).done(function(_this) {
                    return function(res) {
                        _this.setState({
                            loading: false
                        });
                        if (res.success) {
                            _this.setState({
                                vote: !removing && direction,
                                adjustment: res.score_adjustment
                            });
                            return $(ReactDOM.findDOMNode(_this)).find("button").trigger("i:refresh_tooltip")
                        }
                    }
                }(this))
            },
            login_url: function() {
                return "/login?" + $.param({
                    return_to: window.location.toString(),
                    intent: "community"
                })
            },
            render: function() {
                var ref, score, vote_classes;
                score = this.props.score;
                if (this.state.vote) {
                    score += (ref = this.state.adjustment) != null ? ref : this.props.adjustment
                }
                vote_classes = "vote_btn button small";
                return div({}, button({
                    type: "button",
                    "aria-label": this.state.vote === "up" ? "Remove up vote" : "Vote up",
                    className: classNames(vote_classes, "vote_up_btn icon-caret-up", {
                        outline: this.state.vote !== "up",
                        disabled: this.state.loading
                    }),
                    disabled: this.state.loading,
                    onClick: function(_this) {
                        return function() {
                            return _this.vote("up")
                        }
                    }(this)
                }), div({
                    className: "vote_score"
                }, score), this.props.dir !== "up" ? button({
                    type: "button",
                    "aria-label": this.state.vote === "down" ? "Remove down vote" : "Vote down",
                    className: classNames(vote_classes, "vote_down_btn icon-caret-down", {
                        outline: this.state.vote !== "down",
                        disabled: this.state.loading
                    }),
                    disabled: this.state.loading,
                    onClick: function(_this) {
                        return function() {
                            return _this.vote("down")
                        }
                    }(this)
                }) : void 0)
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Admin");
        types = PropTypes;
        P("RemoteDataList", {
            componentDidMount: function() {
                return $.ajax({
                    url: this.props.url,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(_this) {
                    return function(res) {
                        return _this.setState(res)
                    }
                }(this))
            },
            render: function() {
                var ref;
                if (!((ref = this.state) != null ? ref.tag_slugs : void 0)) {
                    return null
                }
                return React.createElement("datalist", {
                    id: this.props.id
                }, this.state.tag_slugs.map(function(_this) {
                    return function(tag) {
                        return option({
                            key: tag,
                            value: tag
                        })
                    }
                }(this)))
            }
        });
        P("TagEditor", {
            getInitialState: function() {
                return {
                    closed: false,
                    featured_tags: this.props.featured_tags,
                    tags: this.props.tags
                }
            },
            update_from_res: function(res) {
                if (res.errors) {
                    this.setState({
                        errors: res.errors
                    });
                    return
                }
                res.featured_tags || (res.featured_tags = []);
                res.tags || (res.tags = []);
                return this.setState(res)
            },
            feature_tag: function(tag, action) {
                if (action == null) {
                    action = "add"
                }
                this.setState({
                    errors: null
                });
                return $.ajax({
                    url: this.props.submit_url,
                    type: "post",
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    data: I.with_csrf({
                        action: action,
                        tag_slug: tag
                    })
                }).done(this.update_from_res)
            },
            render_queue: function() {
                var rating, ref;
                rating = ((ref = this.props.queue_rating) != null ? ref.rating : void 0) || "unrated";
                return div({
                    className: classNames("queue_status", rating, {
                        unrated: !this.props.queue_rating
                    })
                }, a({
                    href: this.props.queue_url
                }, rating))
            },
            render_suggested_tweet: function() {
                if (!this.props.suggested_tweet) {
                    return
                }
                return fragment({}, React.createElement("hr", {}), React.createElement("details", {}, React.createElement("summary", {}, strong({}, "Tweet builder")), textarea({
                    className: "tweet_preview",
                    defaultValue: this.props.suggested_tweet
                }), span({}, "Len: " + this.props.suggested_tweet.length), this.props.cover_url ? div({}, a({
                    href: this.props.cover_url
                }, "Original cover")) : void 0))
            },
            has_featured_tag: function(t) {
                var i, len, ref, tag;
                if (!this.state.featured_tags) {
                    return false
                }
                ref = this.state.featured_tags;
                for (i = 0, len = ref.length; i < len; i++) {
                    tag = ref[i];
                    if (tag.tag_slug === t) {
                        return true
                    }
                }
                return false
            },
            render: function() {
                var ref, ref1, seen_tags;
                if (this.state.closed) {
                    return null
                }
                return this.enclose({}, this.state.errors ? div({
                    className: "form_errors"
                }, this.state.errors.join(", ")) : void 0, this.render_queue(), div({
                    className: "panel_inside"
                }, strong({}, "User tags"), ((ref = this.state.tags) != null ? ref.length : void 0) ? (seen_tags = {}, this.state.tags.map(function(_this) {
                    return function(tag) {
                        if (seen_tags[tag.tag_slug]) {
                            return
                        }
                        seen_tags[tag.tag_slug] = true;
                        return div({
                            className: "tag_row",
                            key: tag.tag_slug
                        }, div({}, a({
                            href: tag.url
                        }, tag.featured ? strong({}, tag.tag_slug) : tag.tag_slug), _this.has_featured_tag(tag.tag_slug) ? " ☑" : fragment({}, " (", a({
                            href: "#",
                            className: "feature_tag_btn",
                            onClick: function(e) {
                                e.preventDefault();
                                return _this.feature_tag(tag.tag_slug)
                            }
                        }, "add"), ")")))
                    }
                }(this))) : div({
                    className: "tag_row"
                }, em({}, "None")), React.createElement("hr", {}), strong({}, "Featured tags"), form({
                    method: "POST",
                    action: this.props.submit_url,
                    className: "new_tag_form",
                    onSubmit: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return I.remote_submit($(e.target)).done(_this.update_from_res).done(function() {
                                var ref1;
                                return (ref1 = _this.tag_input_ref.current) != null ? ref1.value = "" : void 0
                            })
                        }
                    }(this)
                }, R.CSRF({}), input({
                    type: "hidden",
                    name: "action",
                    value: "add"
                }), input({
                    ref: this.tag_input_ref || (this.tag_input_ref = React.createRef()),
                    onMouseEnter: function(_this) {
                        return function() {
                            if (!_this.state.focused) {
                                return _this.setState({
                                    focused: true
                                })
                            }
                        }
                    }(this),
                    onFocus: function(_this) {
                        return function() {
                            if (!_this.state.focused) {
                                return _this.setState({
                                    focused: true
                                })
                            }
                        }
                    }(this),
                    type: "text",
                    name: "tag_slug",
                    list: "tag-options"
                }), this.state.focused ? P.RemoteDataList({
                    url: this.props.submit_url,
                    id: "tag-options"
                }) : void 0, button({}, "Add")), (ref1 = this.state.featured_tags) != null ? ref1.map(function(_this) {
                    return function(tag) {
                        return div({
                            className: "tag_row",
                            key: tag.tag_slug
                        }, div({}, a({
                            href: tag.url
                        }, tag.tag_slug), " (", a({
                            href: "#",
                            className: "feature_tag_btn",
                            onClick: function(e) {
                                e.preventDefault();
                                return _this.feature_tag(tag.tag_slug, "delete")
                            }
                        }, "remove"), ")"))
                    }
                }(this)) : void 0, this.render_suggested_tweet()), button({
                    className: "close_btn",
                    onClick: function(_this) {
                        return function() {
                            return _this.setState({
                                closed: true
                            })
                        }
                    }(this)
                }, "×"))
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Game");
        types = PropTypes;
        P("ReportLightbox", {
            pure: true,
            render: function() {
                var ref;
                return R.Lightbox({
                    className: this.enclosing_class_name()
                }, ((ref = this.state) != null ? ref.submitted : void 0) ? this.render_after_submit() : this.render_report_form())
            },
            get_report_options: function() {
                var out;
                out = [
                    ["broken", "Broken", "Doesn't run, download, or crashes"],
                    ["offensive", "Offensive material"],
                    ["doesnt_own", "Uploader not authorized to distribute"],
                    ["miscategorized", "Miscategorized", "Shows up on wrong part of about:blank, incorrect tags, incorrect platforms, etc."],
                    ["spam", "Spam"],
                    ["other", this.tt("game.report_form.reason_other")]
                ];
                if (this.props.jam) {
                    out.unshift(["invalid_jam_submission", "Invalid jam submission", "Empty or incomplete page, breaks rules, etc."])
                }
                return out
            },
            render_report_form: function() {
                var ref, ref1, ref2, ref3, ref4;
                return fragment({}, h2({}, this.tt("game.report_form.title", {
                    page_title: this.props.page_title
                })), form({
                    className: "form",
                    method: "post",
                    action: this.props.submit_url,
                    onSubmit: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            _this.setState({
                                errors: null,
                                loading: true
                            });
                            return I.remote_submit($(e.target)).done(function(res) {
                                if (res.errors) {
                                    _this.setState({
                                        loading: false,
                                        errors: res.errors
                                    });
                                    return
                                }
                                return _this.setState({
                                    submitted: true
                                })
                            })
                        }
                    }(this)
                }, R.CSRF({}), this.props.support_email || this.props.support_link ? p({
                    className: "support_notice"
                }, this.tt("game.report_form.support_from_creator"), " ", this.props.support_link ? a({
                    rel: "nofollow",
                    target: "blank",
                    className: "forward_link",
                    href: this.props.support_link
                }, this.tt("game.report_form.support_page_link")) : a({
                    rel: "nofollow",
                    target: "blank",
                    className: "forward_link",
                    href: "mailto:" + this.props.support_email
                }, this.tt("game.report_form.email_creator_link"))) : void 0, ((ref = this.state) != null ? ref.errors : void 0) ? R.Forms.FormErrors({
                    errors: this.state.errors
                }) : void 0, p({}, this.tt("game.report_form.form_description")), this.props.jam ? p({}, "This report will be made available to hosts of ", a({
                    href: this.props.jam.url
                }, this.props.jam.name), ".") : void 0, div({
                    className: "input_row"
                }, div({
                    className: "label"
                }, this.tt("game.report_form.reason_label")), R.Forms.RadioButtons({
                    name: "report[reason]",
                    value: ((ref1 = this.state) != null ? ref1.reason : void 0) || "",
                    onChange: function(_this) {
                        return function(e) {
                            return _this.setState({
                                reason: e.target.value
                            })
                        }
                    }(this),
                    options: this.get_report_options()
                })), ((ref2 = this.state) != null ? ref2.reason : void 0) === "doesnt_own" ? div({
                    className: "input_row"
                }, strong({}, "Are you the copyright owner and need to file a DMCA notice?"), " ", a({
                    target: "_blank",
                    href: this.props.changio_support_url,
                    className: "forward_link"
                }, "Contact our support team so we can step you through the process")) : void 0, div({
                    className: "input_row"
                }, label({}, div({
                    className: "label"
                }, this.tt("game.report_form.description_label"), span({
                    className: "sub"
                }, " — ", this.description_description())), textarea({
                    maxLength: "2048",
                    name: "report[description]",
                    required: this.description_required(),
                    placeholder: this.description_required() ? this.t("misc.forms.required") : this.t("misc.forms.optional")
                }))), R.Forms.TextInputRow({
                    title: "Your email",
                    sub: "If your report needs a reply we'll use it to communicate with you",
                    name: "report[email]",
                    defaultValue: this.props.current_user_email,
                    required: this.email_required(),
                    placeholder: this.email_required() ? this.t("misc.forms.required") : this.t("misc.forms.optional")
                }), div({
                    callback: "buttons"
                }, button({
                    disabled: (ref3 = this.state) != null ? ref3.loading : void 0,
                    className: classNames("button", {
                        disabled: (ref4 = this.state) != null ? ref4.loading : void 0
                    })
                }, this.tt("game.report_form.submit_report_button")))))
            },
            render_after_submit: function() {
                return div({
                    className: "report_submitted"
                }, h2({}, this.tt("game.report_form.report_received_header")), p({}, "You report will be reviewed shortly, and action will be taken if necessary. If you have any additional requests then you can ", a({
                    href: this.props.changio_support_url,
                    target: "_blank"
                }, "contact our support team"), "."), p({}, button({
                    type: "button",
                    className: "textlike",
                    onClick: function(_this) {
                        return function(e) {
                            return I.Lightbox.close()
                        }
                    }(this)
                }, this.tt("misc.lightboxes.close"))))
            },
            description_description: function() {
                var ref;
                switch ((ref = this.state) != null ? ref.reason : void 0) {
                    case "broken":
                        return "Please explain what is broken. Include how you tried to run the project, what operating system or browser you're using, and any error messages you saw. We will share your error with the creator to help them fix the issue.";
                    case "invalid_jam_submission":
                        return "Please explain why this submission should be disqualified or removed";
                    case "miscategorized":
                        return "Please explain how this project should be categorized.";
                    default:
                        return "Please provide a summary of your report"
                }
            },
            description_required: function() {
                var ref, ref1;
                return (ref = (ref1 = this.state) != null ? ref1.reason : void 0) === "broken" || ref === "miscategorized" || ref === "other" || ref === "invalid_jam_submission"
            },
            email_required: function() {
                var ref, ref1;
                return (ref = (ref1 = this.state) != null ? ref1.reason : void 0) === "broken" || ref === "doesnt_own"
            }
        })
    })
}).call(this);
(function() {
    I.libs.react.done(function() {
        var P, _rdf, a, br, button, code, div, em, fieldset, form, fragment, h1, h2, h3, h4, h5, h6, iframe, img, input, label, legend, li, ol, optgroup, option, p, pre, section, select, span, strong, textarea, types, ul;
        _rdf = ReactDOMFactories;
        div = _rdf.div, span = _rdf.span, a = _rdf.a, br = _rdf.br, p = _rdf.p, ol = _rdf.ol, ul = _rdf.ul, li = _rdf.li, strong = _rdf.strong, em = _rdf.em, img = _rdf.img, form = _rdf.form, label = _rdf.label, input = _rdf.input, textarea = _rdf.textarea, button = _rdf.button, iframe = _rdf.iframe, h1 = _rdf.h1, h2 = _rdf.h2, h3 = _rdf.h3, h4 = _rdf.h4, h5 = _rdf.h5, h6 = _rdf.h6, pre = _rdf.pre, code = _rdf.code, select = _rdf.select, option = _rdf.option, section = _rdf.section, optgroup = _rdf.optgroup, fieldset = _rdf.fieldset, legend = _rdf.legend;
        fragment = React.createElement.bind(null, React.Fragment);
        fragment.type = React.fragment;
        P = R["package"]("Library");
        types = PropTypes;
        P("RateGameLightbox", {
            propTypes: {
                game: types.object.isRequired,
                follow_button: types.object,
                game_rating: types.object
            },
            is_closable: function() {
                var ref, ref1;
                if (((ref = this.props) != null ? (ref1 = ref.lightbox_props) != null ? ref1.close : void 0 : void 0) === false) {
                    return false
                }
                return true
            },
            submit_rating: function(e) {
                e.preventDefault();
                this.setState({
                    loading: true
                });
                return I.remote_submit($(e.target)).done(function(_this) {
                    return function(res) {
                        var base, ref, ref1;
                        if (res.errors) {
                            _this.setState({
                                loading: false,
                                errors: res.errors
                            });
                            return
                        }
                        if ((ref = _this.blurb_input_ref.current) != null) {
                            ref.clear_memory()
                        }
                        _this.setState({
                            submitted: true,
                            loading: false,
                            saved_score: (ref1 = res.game_rating) != null ? ref1.score : void 0
                        });
                        return typeof(base = _this.props).on_save_rating === "function" ? base.on_save_rating(res) : void 0
                    }
                }(this))
            },
            delete_rating: function() {
                if (!this.props.game_rating) {
                    return
                }
                this.setState({
                    loading: true
                });
                return $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: this.props.rate_url,
                    xhrFields: {
                        withCredentials: true
                    },
                    data: I.with_csrf({
                        remove_game_rating: "1"
                    })
                }).done(function(_this) {
                    return function(res) {
                        var base, ref;
                        _this.setState({
                            loading: false
                        });
                        if (res.errors) {
                            _this.setState({
                                errors: res.errors
                            });
                            return
                        }
                        if ((ref = _this.blurb_input_ref.current) != null) {
                            ref.clear_memory()
                        }
                        _this.setState({
                            submitted: true,
                            deleted: true,
                            game_rating: false
                        });
                        return typeof(base = _this.props).on_delete_rating === "function" ? base.on_delete_rating(res) : void 0
                    }
                }(this))
            },
            render_rating_form: function() {
                var blurb, created_at, ref, ref1, ref2;
                return fragment({}, h2({}, this.tt("library.rate_game.rate_header", {
                    project_title: span({
                        className: "object_title"
                    }, this.props.game.title)
                })), form({
                    className: "form",
                    action: this.props.rate_url,
                    onSubmit: this.submit_rating
                }, R.CSRF({}), ((ref = this.state) != null ? ref.errors : void 0) ? R.Forms.FormErrors({
                    scroll_into_view: false,
                    errors: this.state.errors
                }) : void 0, this.props.game_rating ? (created_at = this.props.game_rating.created_at, p({}, this.tt("library.rate_game.you_rated_this_project_ago", {
                    time_ago: span({
                        className: "date_format",
                        title: created_at
                    }, "" + moment.utc(created_at).local().fromNow())
                }))) : p({}, this.tt("library.rate_game.choose_stars")), div({
                    className: "star_wrapper"
                }, R.Forms.StarPicker({
                    className: "star_picker",
                    name: "game_rating",
                    defaultValue: (ref1 = this.props.game_rating) != null ? ref1.score : void 0
                })), div({
                    className: "input_row"
                }, div({
                    className: "label"
                }, "Your review", div({
                    className: "sub"
                }, "Share what you liked or disliked about this project. Our ", a({
                    target: "_blank",
                    href: "about:blank"
                }, "community rules"), " apply here. Reviews are shared with developers and your followers.")), R.Redactor({
                    defaultValue: (blurb = (ref2 = this.props.game_rating) != null ? ref2.blurb : void 0) ? blurb._unsafe || blurb._safe : void 0,
                    ref: this.blurb_input_ref || (this.blurb_input_ref = React.createRef()),
                    remember_key: "game_rating:" + this.props.game.id,
                    name: "game_rating_blurb",
                    placeholder: "Optional",
                    redactor_opts: {
                        plugins: ["table", "alignment", "video"],
                        buttons: ["bold", "italic", "deleted", "lists", "link"]
                    }
                })), div({
                    className: "buttons"
                }, button({
                    className: "button"
                }, this.props.game_rating ? this.tt("misc.forms.save") : this.tt("misc.forms.submit")), this.props.game_rating ? button({
                    type: "button",
                    className: "textlike delete_rating_btn",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            if (confirm("Are you sure you want to delete your rating & review")) {
                                return _this.delete_rating()
                            }
                        }
                    }(this)
                }, this.tt("library.rate_game.delete_button")) : void 0)))
            },
            render_after_rating: function() {
                var close_button;
                close_button = this.is_closable() ? p({}, button({
                    type: "button",
                    onClick: function(_this) {
                        return function(e) {
                            e.preventDefault();
                            return I.Lightbox.close()
                        }
                    }(this),
                    className: "textlike"
                }, this.tt("misc.lightboxes.close"))) : void 0;
                if (this.state.deleted) {
                    return fragment({}, h2({}, this.tt("library.rate_game.rating_removed_header")), p({}, this.tt("library.rate_game.rating_deleted_summary")), close_button)
                }
                return fragment({}, h2({}, this.tt("library.rate_game.rating_saved_header")), this.props.follow_button && (this.state.saved_score || 0) >= 3 ? div({
                    className: "suggested_follow"
                }, p({}, this.tt("library.rate_game.follow_creator", {
                    project_title: a({
                        href: this.props.game.url,
                        target: "_blank"
                    }, this.props.game.title)
                })), p({}, R.FollowButton(this.props.follow_button))) : p({}, "Your rating has been saved."), close_button)
            },
            render: function() {
                var ref;
                return R.Lightbox(Object.assign({
                    className: this.enclosing_class_name()
                }, this.props.lightbox_props), ((ref = this.state) != null ? ref.submitted : void 0) ? this.render_after_rating() : this.render_rating_form())
            }
        })
    })
}).call(this);