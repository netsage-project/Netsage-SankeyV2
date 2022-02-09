'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', './css/sankeynetsage_sankey.css!', './js/sankeynetsage_d3.v3', './js/sankeynetsage_sankey.js'], function (_export, _context) {
    "use strict";

    var MetricsPanelCtrl, _, kbn, d3, d3sankey, _createClass, panelDefaults, table_data, docs_data, NetSageSankey;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_appCoreUtilsKbn) {
            kbn = _appCoreUtilsKbn.default;
        }, function (_cssSankeynetsage_sankeyCss) {}, function (_jsSankeynetsage_d3V) {
            d3 = _jsSankeynetsage_d3V.default;
        }, function (_jsSankeynetsage_sankeyJs) {
            d3sankey = _jsSankeynetsage_sankeyJs.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            /*
             * (C) 2018 Tyson Seto-Mook, Laboratory for Advanced Visualization and Applications, University of Hawaii at Manoa.
             */

            /*
              Copyright 2018 The Trustees of Indiana University
            
              Licensed under the Apache License, Version 2.0 (the "License");
              you may not use this file except in compliance with the License.
              You may obtain a copy of the License at
            
              http://www.apache.org/licenses/LICENSE-2.0
            
              Unless required by applicable law or agreed to in writing, software
              distributed under the License is distributed on an "AS IS" BASIS,
              WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
              See the License for the specific language governing permissions and
              limitations under the License.
            */

            d3.sankey = d3sankey;

            ////// place global variables here ////
            panelDefaults = {
                //docs_editor variables
                docs_editor_aggregation_options: ['Total', 'Average', 'Max', 'Min'],
                docs_editor_aggregation: 'Total',
                docs_editor_link_width_input: '',
                docs_editor_to_Byte: false,
                docs_editor_choices: [],
                docs_editor_option_nodes: [],
                docs_data: [],
                // table_editor variables
                table_editor_link_width_label: '',
                table_editor_link_width_units: '',
                table_editor_choices: [],
                table_editor_node_labels: [],
                table_editor_option_nodes: [], // used to store data mapping
                table_editor_unitFormats_TEMP: [{
                    text: 'kbn.getUnitFormats()',
                    submenu: [{
                        text: 'Not implemented yet',
                        value: 'kbn.getUnitFormats()'
                    }, {
                        text: 'test unit',
                        value: 'short'
                    }]
                }],
                table_editor_unitFormats: '',
                table_data_type: '',
                // table_data: [],
                // other variables
                auto_format_labels: false,
                label_nodes: [],
                data_type: '',
                table_editor_kbnUnitFormats: kbn.getUnitFormats()
            };
            table_data = [];
            docs_data = [];

            _export('NetSageSankey', NetSageSankey = function (_MetricsPanelCtrl) {
                _inherits(NetSageSankey, _MetricsPanelCtrl);

                function NetSageSankey($scope, $injector) {
                    _classCallCheck(this, NetSageSankey);

                    var _this = _possibleConstructorReturn(this, (NetSageSankey.__proto__ || Object.getPrototypeOf(NetSageSankey)).call(this, $scope, $injector));

                    _.defaults(_this.panel, panelDefaults);
                    _this.sankeynetsage_holder_id = 'sankeynetsage_' + _this.panel.id;
                    _this.containerDivId = 'container_' + _this.sankeynetsage_holder_id;
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('data-error', _this.onDataError.bind(_this));
                    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('init-panel-actions', _this.onInitPanelActions.bind(_this));
                    return _this;
                }

                _createClass(NetSageSankey, [{
                    key: 'onDataReceived',
                    value: function onDataReceived(dataList) {
                        table_data = [];
                        docs_data = [];
                        this.panel.docs_table_data = [];
                        this.panel.label_nodes = [];
                        this.panel.data_type = '';
                        this.process_data(dataList);
                        this.render();
                    }
                }, {
                    key: 'process_data',
                    value: function process_data(dataList) {
                        if (dataList.length > 0) {
                            // set current data type
                            this.panel.data_type = dataList[0].type;
                            console.log(this.panel.data_type);

                            // check if data type is full record
                            if (this.panel.data_type === 'docs') {
                                this.panel.label_nodes = this.panel.docs_editor_option_nodes.slice(0);
                                this.process_docs_data(dataList);
                            } else if (this.panel.data_type === 'table') {
                                this.panel.label_nodes = this.panel.table_editor_node_labels.slice(0);
                                this.process_table_data(dataList);
                            } else {
                                console.error("[!] Sankey plugin Error:  Unknown data type '", this.panel.data_type, "' cannot process data");
                            }
                        } else {
                            console.error('[!] Sankey plugin Error: No data to visualize');
                        }
                    }
                }, {
                    key: 'process_table_data',
                    value: function process_table_data(dataList) {
                        this.panel.table_editor_option_nodes = [];
                        this.panel.table_data_type = dataList[0].columns[dataList[0].columns.length - 1].text;
                        var self = this;
                        for (var i = 0; i < dataList[0].columns.length - 1; i++) {
                            self.panel.table_editor_option_nodes.push(dataList[0].columns[i].text);
                        }
                        table_data = dataList[0].rows.slice(0);
                    }
                }, {
                    key: 'process_docs_data',
                    value: function process_docs_data(dataList) {
                        function matchingFlow(elk_datapoint, agData) {
                            return elk_datapoint.meta.src_ip === agData.meta.src_ip && elk_datapoint.meta.src_asn === agData.meta.src_asn && elk_datapoint.meta.src_port === agData.meta.src_port && elk_datapoint.meta.protocol === agData.meta.protocol && elk_datapoint.meta.dst_port === agData.meta.dst_port && elk_datapoint.meta.dst_asn === agData.meta.dst_asn && elk_datapoint.meta.dst_ip === agData.meta.dst_ip;
                        }

                        // process full records here
                        var self = this;
                        //update with the data!
                        _.forEach(dataList, function (data) {
                            for (var i = 0; i < data.datapoints.length; i++) {
                                var elk_datapoint = data.datapoints[i];

                                var flowNotExists = true;
                                if (docs_data.length > 0) {
                                    _.forEach(self.panel.docs_data, function (agData) {
                                        if (matchingFlow(elk_datapoint, agData)) {
                                            flowNotExists = false;
                                            //count total flows
                                            agData.sankey_totalFlows++;
                                            //aggregate data
                                            switch (self.panel.aggregation) {
                                                case 'Average':
                                                    for (var k in agData.values) {
                                                        agData.values[k] += elk_datapoint.values[k];
                                                    }
                                                    break;
                                                case 'Total':
                                                    for (var k in agData.values) {
                                                        agData.values[k] += elk_datapoint.values[k];
                                                    }
                                                    break;
                                                case 'Max':
                                                    for (var k in agData.values) {
                                                        if (agData.values[k] != elk_datapoint.values[k]) console.log(agData._id);
                                                        agData.values[k] = Math.max(agData.values[k], elk_datapoint.values[k]);
                                                    }
                                                    break;
                                                case 'Min':
                                                    for (var k in agData.values) {
                                                        agData.values[k] = Math.min(agData.values[k], elk_datapoint.values[k]);
                                                    }
                                                    break;
                                                default:
                                                    elk_datapoint.sankey_totalFlows++;
                                                    for (var k in agData.values) {
                                                        agData.values[k] += elk_datapoint.values[k];
                                                    }
                                            }
                                        }
                                    });
                                }
                                // add flow if it doesnt exists in aggregated data
                                if (flowNotExists) {
                                    elk_datapoint.sankey_totalFlows = 1;
                                    self.panel.docs_data.push(elk_datapoint);
                                }
                            }
                        });

                        // calculate averages for doc type
                        if (self.panel.docs_data.length > 0) {
                            _.forEach(self.panel.docs_data, function (agData) {
                                switch (self.panel.aggregation) {
                                    case 'Average':
                                        for (var k in agData.values) {
                                            agData.values[k] = agData.values[k] / agData.sankey_totalFlows;
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                    }
                }, {
                    key: 'onDataError',
                    value: function onDataError(err) {
                        this.dataRaw = [];
                    }
                }, {
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('Raw Documents Options', 'public/plugins/netsage-sankey/docs_editor.html', 2);
                        this.addEditorTab('Aggregated Data Options', 'public/plugins/netsage-sankey/table_editor.html', 2);
                        this.render();
                    }
                }, {
                    key: 'onInitPanelActions',
                    value: function onInitPanelActions(actions) {
                        this.render();
                    }
                }, {
                    key: 'docs_editor_addNewChoice',
                    value: function docs_editor_addNewChoice() {
                        var num = this.panel.docs_editor_choices.length + 1;
                        this.panel.docs_editor_choices.push(num);
                        this.panel.docs_editor_option_nodes.push('');
                    }
                }, {
                    key: 'docs_editor_removeChoice',
                    value: function docs_editor_removeChoice(index) {
                        this.panel.docs_editor_choices.splice(index, 1);
                        this.panel.docs_editor_option_nodes.splice(index, 1);
                        if (this.panel.docs_editor_choices.length < 1) this.panel.docs_editor_option_nodes = [];
                    }
                }, {
                    key: 'table_editor_addNewChoice',
                    value: function table_editor_addNewChoice() {
                        var num = this.panel.table_editor_choices.length + 1;
                        this.panel.table_editor_choices.push(num);
                        this.panel.table_editor_node_labels.push('');
                    }
                }, {
                    key: 'table_editor_removeChoice',
                    value: function table_editor_removeChoice(index) {
                        this.panel.table_editor_choices.splice(index, 1);
                        this.panel.table_editor_node_labels.splice(index, 1);
                        if (this.panel.table_editor_choices.length < 1) this.panel.table_editor_node_labels = [];
                    }
                }, {
                    key: 'setUnitFormat',
                    value: function setUnitFormat(subItem) {
                        this.panel.table_editor_unitFormats = subItem.value;
                        this.render();
                    }
                }, {
                    key: 'formatBytes',
                    value: function formatBytes(val) {
                        var hrFormat = null;
                        var factor = 1024.0;
                        val = val / 8.0;

                        var b = val;
                        var k = val / factor;
                        var m = val / factor / factor;
                        var g = val / factor / factor / factor;
                        var t = val / factor / factor / factor / factor;
                        var p = val / factor / factor / factor / factor / factor;

                        if (p > 1) {
                            hrFormat = p.toFixed(2) + '(PB)';
                        } else if (t > 1) {
                            hrFormat = t.toFixed(2) + '(TB)';
                        } else if (g > 1) {
                            hrFormat = g.toFixed(2) + '(GB)';
                        } else if (m > 1) {
                            hrFormat = m.toFixed(2) + '(MB)';
                        } else if (k > 1) {
                            hrFormat = k.toFixed(2) + '(KB)';
                        } else {
                            hrFormat = b.toFixed(2) + '(Bytes)';
                        }

                        return hrFormat;
                    }
                }, {
                    key: 'formatBits',
                    value: function formatBits(val) {
                        var hrFormat = null;
                        var factor = 1024.0;

                        var b = val;
                        var k = val / factor;
                        var m = val / factor / factor;
                        var g = val / factor / factor / factor;
                        var t = val / factor / factor / factor / factor;
                        var p = val / factor / factor / factor / factor / factor;

                        if (p > 1) {
                            hrFormat = p.toFixed(2) + '(Pb)';
                        } else if (t > 1) {
                            hrFormat = t.toFixed(2) + '(Tb)';
                        } else if (g > 1) {
                            hrFormat = g.toFixed(2) + '(Gb)';
                        } else if (m > 1) {
                            hrFormat = m.toFixed(2) + '(Mb)';
                        } else if (k > 1) {
                            hrFormat = k.toFixed(2) + '(Kb)';
                        } else {
                            hrFormat = b.toFixed(2) + '(bits)';
                        }

                        return hrFormat;
                    }
                }, {
                    key: 'setup',
                    value: function setup() {
                        var ctrl = this;
                        //check if there is a container to place the graph
                        if (!document.getElementById(ctrl.sankeynetsage_holder_id)) {
                            return;
                        }
                        //not sure what this does
                        function getValueFromString(flowRecord, keyString) {
                            return eval('flowRecord["' + keyString.trim().split('.').join('"]["') + '"]');
                        }
                        //to keep values for rendering sankey, either docs or table
                        var sankeyData = [];

                        if (ctrl.panel.data_type === 'docs') {
                            // update node labels
                            // convert docs data to sankey data
                            if (docs_data.length > 0) {
                                _.forEach(docs_data, function (agData, index) {
                                    for (var i = 0; i < ctrl.panel.docs_editor_option_nodes.length - 1; i++) {
                                        //get links info
                                        var source = getValueFromString(agData, ctrl.panel.docs_editor_option_nodes[i]);
                                        var target = getValueFromString(agData, ctrl.panel.docs_editor_option_nodes[i + 1]);
                                        var value = getValueFromString(agData, ctrl.panel.docs_editor_link_width_input);

                                        // to avoid cyclic sankey, appending (src) and (dst) to names
                                        var source_option = ctrl.panel.docs_editor_option_nodes[i];
                                        var target_option = ctrl.panel.docs_editor_option_nodes[i + 1];
                                        source += source_option.includes('src') || source_option.includes('dst') ? source_option.includes('src') ? ' (src)' : ' (dst)' : '';
                                        target += target_option.includes('src') || target_option.includes('dst') ? target_option.includes('src') ? ' (src)' : ' (dst)' : '';

                                        // add to sankeyData array
                                        sankeyData.push({
                                            source: source,
                                            target: target,
                                            value: value,
                                            //"label":"flow-"+index});
                                            label: ctrl.sankeynetsage_holder_id + '_flow-' + index
                                        });
                                    }
                                });
                            }
                        } else if (ctrl.panel.data_type === 'table') {
                            // update node labels
                            if (ctrl.panel.table_editor_node_labels.length > 0) {
                                ctrl.panel.label_nodes = ctrl.panel.table_editor_node_labels.slice(0);
                            } else {
                                ctrl.panel.label_nodes = ctrl.panel.table_editor_option_nodes.slice(0);
                            }
                            // convert table data to sankey data
                            if (table_data.length > 0) {
                                _.forEach(table_data, function (tData, index) {
                                    for (var i = 0; i < tData.length - 2; i++) {
                                        // last index is value, so -2 to prevent using value as a node
                                        //get links info
                                        var source = tData[i];
                                        var target = tData[i + 1];
                                        var value = tData[tData.length - 1];

                                        // to avoid cyclic sankey, appending (src) and (dst) to names
                                        var source_option = ctrl.panel.table_editor_option_nodes[i];
                                        var target_option = ctrl.panel.table_editor_option_nodes[i + 1];
                                        source += source_option.includes('src') || source_option.includes('dst') ? source_option.includes('src') ? ' (src)' : ' (dst)' : '';
                                        target += target_option.includes('src') || target_option.includes('dst') ? target_option.includes('src') ? ' (src)' : ' (dst)' : '';

                                        // add to sankeyData array
                                        sankeyData.push({
                                            source: source,
                                            target: target,
                                            value: value,
                                            //"label":"flow-"+index});
                                            label: ctrl.sankeynetsage_holder_id + '_flow-' + index
                                        });
                                    }
                                });
                            }
                        }

                        // get sankey graph from data
                        var graph = ctrl.createSankeyGraphFromData(sankeyData);

                        //render sankey
                        ctrl.renderSankey(graph);
                    }
                }, {
                    key: 'getFormattedValue',
                    value: function getFormattedValue(value) {
                        value = value / 1000;
                        var volume = value;
                        if (value < 1000) {
                            volume = Math.round(value * 10) / 10 + ' KB';
                        } else {
                            value = value / 1000;
                            if (value < 1000) {
                                volume = Math.round(value * 10) / 10 + ' MB';
                            } else {
                                value = value / 1000;
                                if (value < 1000) {
                                    volume = Math.round(value * 10) / 10 + ' GB';
                                } else {
                                    value = value / 1000;
                                    if (value < 1000) {
                                        volume = Math.round(value * 10) / 10 + ' TB';
                                    } else {
                                        volume = Math.round(value * 10) / 10 + ' PB';
                                    }
                                }
                            }
                        }
                        return volume;
                    }
                }, {
                    key: 'createSankeyGraphFromData',
                    value: function createSankeyGraphFromData(data) {
                        //set up graph in same style as original example but empty
                        var graph = {
                            nodes: [],
                            links: []
                        };

                        data.forEach(function (d) {
                            graph.nodes.push({
                                name: d.source
                            });
                            graph.nodes.push({
                                name: d.target
                            });
                            graph.links.push({
                                source: d.source,
                                target: d.target,
                                value: +d.value,
                                label: d.label
                            });
                        });

                        // return only the distinct / unique nodes
                        graph.nodes = d3.keys(d3.nest().key(function (d) {
                            return d.name;
                        }).map(graph.nodes));

                        // loop through each link replacing the text with its index from node
                        graph.links.forEach(function (d, i) {
                            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
                            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
                        });

                        //now loop through each nodes to make nodes an array of objects
                        // rather than an array of strings
                        graph.nodes.forEach(function (d, i) {
                            graph.nodes[i] = {
                                name: d
                            };
                        });

                        return graph;
                    }
                }, {
                    key: 'renderSankey',
                    value: function renderSankey(graph) {
                        if (graph.links.length == 0 || graph.nodes.length == 0) {
                            return;
                        }

                        var ctrl = this;
                        d3.select('#' + ctrl.containerDivId).selectAll('g').remove();

                        var units = 'Widgets';

                        var offw = 900;
                        var offh = 450;
                        if (document.getElementById(ctrl.sankeynetsage_holder_id)) {
                            offw = document.getElementById(ctrl.sankeynetsage_holder_id).offsetWidth;
                            offh = document.getElementById(ctrl.sankeynetsage_holder_id).offsetHeight;
                        }

                        if (offh == 0) {
                            return setTimeout(function () {
                                ctrl.renderSankey(graph);
                            }, 250);
                        }

                        var margin = {
                            top: 10,
                            right: 10,
                            bottom: 10,
                            left: 10
                        };
                        var width = offw - margin.left - margin.right;
                        var height = offh - margin.top - margin.bottom;

                        var formatNumber = d3.format(',.0f'); // zero decimal places
                        //var format = function(d) { return formatNumber(d) + " " + units; };
                        var format = function format(d) {
                            return ctrl.panel.data_type === 'docs' ? ctrl.panel.docs_editor_to_Byte ? ctrl.formatBytes(d) : ctrl.formatBits(d) : d + ' ' + ctrl.panel.table_editor_link_width_label + ' (' + ctrl.panel.table_data_type + ')';
                        };
                        var color = d3.scale.category20();

                        // append the svg canvas to the page
                        var svg = d3.select('#sankey_svg_' + ctrl.panel.id);
                        if (svg.empty()) {
                            svg = d3.select('#' + ctrl.containerDivId).append('svg').attr('width', '100%').attr('height', '100%').attr('id', 'sankey_svg_' + ctrl.panel.id).attr('class', 'sankey').append('g');
                        }

                        // Set the sankey diagram properties
                        var sankey = d3.sankey().nodeWidth(36).nodePadding(40).size([width, height]);

                        var path = sankey.link();

                        sankey.nodes(graph.nodes).links(graph.links).layout(32);

                        // move nodes down to make space for labels
                        for (var i = 0; i < sankey.nodes().length; i++) {
                            if (sankey.nodes()[i].y < 25) {
                                sankey.nodes()[i].y = 25;
                            }
                        }
                        sankey.relayout();

                        // create node location object
                        var nodeLocations = {};
                        // store only unique x positions of the nodes
                        _.forEach(graph.nodes, function (n) {
                            if (!(n.x in nodeLocations)) {
                                nodeLocations[n.x + n.dx / 2] = 1;
                            }
                        });
                        // convert from string to Numbers
                        nodeLocations = Object.keys(nodeLocations).map(Number);
                        nodeLocations = nodeLocations.sort(function (a, b) {
                            return a - b;
                        });
                        // add first value to last node value
                        nodeLocations[nodeLocations.length - 1] += nodeLocations[0];
                        // set first value to 0
                        nodeLocations[0] = 0;

                        /**
                        * A method to  create human readable node names 
                        * @method auto_format_labels
                        * @param {String} nodeName 
                        */
                        function auto_format_node_labels(nodeName) {
                            if (ctrl.panel.auto_format_labels) {
                                return nodeName.replace('meta.', '').replace('.keyword', '').replace(new RegExp('_', 'g'), ' ').replace(new RegExp('[.]', 'g'), ' ').replace('src', 'Source').replace('dst', 'Destination');
                            }
                            // other wise return same name
                            return nodeName;
                        }
                        // add node labels
                        var node_labels = svg.append('g').selectAll('.node-label').data(ctrl.panel.label_nodes).enter().append('text').attr('class', 'node-label').attr('x', function (d) {
                            return nodeLocations[ctrl.panel.label_nodes.indexOf(d)];
                        }).attr('y', margin.top + 5).attr('text-anchor', function (d) {
                            switch (ctrl.panel.label_nodes.indexOf(d)) {
                                case 0:
                                    return 'start';
                                case ctrl.panel.label_nodes.length - 1:
                                    return 'end';
                                default:
                                    return 'middle';
                            }
                        }).text(function (d) {
                            return auto_format_node_labels(d);
                        });

                        // add in the links
                        var link = svg.append('g').selectAll('.link').data(graph.links).enter().append('path').attr('class', function (d) {
                            return 'link' + ' ' + d.label;
                        }).attr('d', path).style('stroke-width', function (d) {
                            return Math.max(1, d.dy);
                        }).sort(function (a, b) {
                            return b.dy - a.dy;
                        }).on('mouseover', function (event) {
                            _.forEach(document.getElementsByClassName(event.label), function (el) {
                                el.classList.add('link-highlight');
                            });
                        }).on('mouseout', function (event) {
                            _.forEach(document.getElementsByClassName(event.label), function (el) {
                                el.classList.remove('link-highlight');
                            });
                        });

                        // add the link titles
                        link.append('title').text(function (d) {
                            //return d.source.name + ' → ' + d.target.name + '\n' + format(d.value);
                            return d.source.name + ' → ' + d.target.name + '\n' + ctrl.getFormattedValue(d.value);
                        });

                        // add in the nodes
                        var node = svg.append('g').selectAll('.node').data(graph.nodes).enter().append('g').attr('class', 'node').attr('transform', function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        }).on('mouseover', function (event) {
                            var hl = [];
                            _.forEach(event.sourceLinks, function (sl) {
                                hl.push(sl.label);
                            });
                            _.forEach(event.targetLinks, function (tl) {
                                hl.push(tl.label);
                            });
                            _.forEach(hl, function (flow) {
                                _.forEach(document.getElementsByClassName(flow), function (el) {
                                    el.classList.add('link-highlight');
                                });
                            });
                        }).on('mouseout', function (event) {
                            var hl = [];
                            _.forEach(event.sourceLinks, function (sl) {
                                hl.push(sl.label);
                            });
                            _.forEach(event.targetLinks, function (tl) {
                                hl.push(tl.label);
                            });
                            _.forEach(hl, function (flow) {
                                _.forEach(document.getElementsByClassName(flow), function (el) {
                                    el.classList.remove('link-highlight');
                                });
                            });
                        });

                        // add the rectangles for the nodes
                        node.append('rect').attr('height', function (d) {
                            return d.dy;
                        }).attr('width', sankey.nodeWidth()).attr('rx', 3).style('fill', function (d) {
                            d.color = '#cdcdcd';
                            if (d.targetLinks.length === 0) {
                                d.color = color(d.name.replace(/ .*/, ''));
                                var cl = [];
                                _.forEach(d.sourceLinks, function (sl) {
                                    cl.push(sl.label);
                                });
                                _.forEach(cl, function (flow) {
                                    _.forEach(document.getElementsByClassName(flow), function (el) {
                                        //el.style.cssText += "stroke:" + d.color + ";";
                                        console.log(d.color);

                                        if (ctrl.panel.monoChromaticSelected) {
                                            el.style.cssText += 'stroke:' + ctrl.panel.monochromaticColor + ';';
                                        } else {
                                            el.style.cssText += 'stroke:' + d.color + ';';
                                        }
                                    });
                                });
                            }
                            if (ctrl.panel.monoChromaticSelected) {
                                return ctrl.panel.monochromaticColor;
                            } else {
                                return d.color;
                            }
                        }).style('stroke', function (d) {
                            return d3.rgb(d.color).darker(2);
                        }).append('title').text(function (d) {
                            //return d.name + '\n' + format(d.value);
                            return d.name + '\n' + ctrl.getFormattedValue(d.value);
                        });

                        // add in the title for the nodes
                        node.append('text').attr('x', -6).attr('y', function (d) {
                            return d.dy / 2;
                        }).attr('dy', '.35em').attr('text-anchor', 'end').attr('transform', null).text(function (d) {
                            return d.name;
                        }).filter(function (d) {
                            return d.x < width / 2;
                        }).attr('x', 6 + sankey.nodeWidth()).attr('text-anchor', 'start');

                        // the function for moving the nodes
                        function dragmove(d) {
                            d3.select(this).attr('transform', 'translate(' + d.x + ',' + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ')');
                            sankey.relayout();
                            link.attr('d', path);
                        }
                    }
                }, {
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        var self = this;
                        ctrl.events.on('render', self.setup.bind(self));
                        ctrl.events.on('refresh', self.setup.bind(self));
                    }
                }]);

                return NetSageSankey;
            }(MetricsPanelCtrl));

            _export('NetSageSankey', NetSageSankey);

            NetSageSankey.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=netsage_sankey.js.map
