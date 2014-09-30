(function() {
  var add_parent, all_dates, cell_width, class_name_from_series_node, click_cat, click_series, create_axis_control, create_axis_controls, create_data_columns, create_series_label, create_series_rows, create_sparklines, datatable_width, draw_spark_area, draw_spark_path, draw_sparklines, flatten, flatten_children, mouseout_series, mouseover_series, populate_dates, series_height, series_row_class, spark_area_path, spark_line, trimmed_data_object, x, y;

  cell_width = 50;

  series_height = 45;

  datatable_width = 300;

  x = d3.scale.linear().clamp(true).range([0, 145]);

  y = d3.scale.linear().range([series_height, 5]);

  all_dates = function() {
    return d3.select("#datatable_slider_div").datum();
  };

  spark_line = d3.svg.line().x(function(d, i) {
    return x(i);
  }).y(function(d) {
    return d;
  }).defined(function(d) {
    return d !== null;
  });

  spark_area_path = d3.svg.area().x(function(d, i) {
    return x(i);
  }).y1(function(d) {
    return d;
  }).y0(series_height).defined(function(d) {
    return d !== null;
  });

  window.collapse = function(cat) {
    cat.attr("state", "collapsed");
    return d3.select(cat.node().parentNode).selectAll("div.series").transition().style("height", "0px");
  };

  window.expand = function(cat) {
    cat.attr("state", "expanded");
    return d3.select(cat.node().parentNode).selectAll("div.series").filter(function(d) {
      var child, collapsed, row;
      row = d3.select(this);
      collapsed = row.attr("state") === "collapsed";
      child = row.classed("child");
      return !child || !collapsed;
    }).transition().style("height", series_height + "px");
  };

  class_name_from_series_node = function(node) {
    return series_to_class(node.datum().udaman_name);
  };

  window.collapse_series = function(series) {
    series.attr("state", "collapsed");
    return d3.selectAll(".child_of_" + (class_name_from_series_node(series))).transition().style("height", "0px").attr("state", "collapsed");
  };

  window.expand_series = function(series) {
    series.attr("state", "expanded");
    return d3.selectAll(".child_of_" + (class_name_from_series_node(series))).transition().style("height", series_height + "px").attr("state", "expanded");
  };

  click_cat = function(d) {
    var cat;
    cat = d3.select(this);
    if (cat.attr("state") === "expanded") {
      return collapse(cat);
    } else {
      return expand(cat);
    }
  };

  click_series = function(d) {
    var series;
    series = d3.select(this);
    if (series.attr("state") === "expanded") {
      return collapse_series(series);
    } else {
      return expand_series(series);
    }
  };

  mouseover_series = function(d) {
    var this_cat;
    return this_cat = d3.select(this).style("background-color", "#EEE");
  };

  mouseout_series = function(d) {
    return d3.selectAll(".series").style("background-color", "#FFF").selectAll("div");
  };

  add_parent = function(series_data, parent) {
    series_data.series_parent = parent;
    return series_data;
  };

  flatten_children = function(series_data) {
    var series, series_list, _i, _len, _ref;
    series_list = [];
    series_list.push(add_parent(series_data, ""));
    if (series_data.children != null) {
      _ref = series_data.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        series = _ref[_i];
        series_list.push(add_parent(series, series_data.udaman_name));
      }
    }
    return series_list;
  };

  flatten = function(series_list) {
    var new_list, series, _i, _len;
    new_list = [];
    for (_i = 0, _len = series_list.length; _i < _len; _i++) {
      series = series_list[_i];
      new_list = new_list.concat(flatten_children(series));
    }
    return new_list;
  };

  trimmed_data_object = function(d, start_i, end_i) {
    var new_d;
    new_d = jQuery.extend(true, {}, d);
    new_d.spark_data = d.data.slice(start_i, end_i + 1);
    y.domain(d3.extent(new_d.spark_data));
    new_d.scaled_data = new_d.spark_data.map(function(e) {
      if (e === null) {
        return null;
      } else {
        return y(e);
      }
    });
    return new_d;
  };

  window.trim_sparklines = function(event, ui) {
    return draw_sparklines(ui.values, 0);
  };

  draw_sparklines = function(extent, duration) {
    var cat_series, dates, end_i, point, start_i, svg, trimmed_dates;
    cat_series = d3.selectAll("div.series");
    start_i = extent[0];
    end_i = extent[1];
    point = end_i - start_i;
    x.domain([0, end_i - start_i]);
    dates = d3.select("#sparkline_slider_div").datum();
    trimmed_dates = dates.slice(start_i, end_i + 1);
    d3.select("#sparkline_header").text(trimmed_dates[end_i - start_i]);
    svg = cat_series.select("svg").datum(function(d) {
      return trimmed_data_object(d[freq], start_i, end_i);
    });
    draw_spark_path(svg, duration);
    return draw_spark_area(svg, duration);
  };

  draw_spark_path = function(svg, duration) {
    var spark_path;
    spark_path = svg.selectAll("path.spark").data(function(d) {
      return [d.scaled_data];
    });
    spark_path.enter().append("path").attr("class", "spark").attr("stroke", "#3182bd").attr("fill", "none");
    return spark_path.transition().duration(duration).attr("d", spark_line);
  };

  draw_spark_area = function(svg, duration) {
    var spark_area;
    spark_area = svg.selectAll("path.spark_area").data(function(d) {
      return [d.scaled_data];
    });
    spark_area.enter().append("path").attr("class", "spark_area").attr("stroke", "none").attr("fill", "#3182bd").attr("fill-opacity", .1);
    return spark_area.transition().duration(duration).attr("d", spark_area_path);
  };

  window.slide_table = function(event, ui) {
    var offset, offset_val;
    offset_val = ui.value + 1;
    offset = -(offset_val * cell_width - datatable_width);
    return d3.selectAll(".container").transition().duration(200).style("margin-left", offset + "px");
  };

  populate_dates = function() {
    var container;
    container = d3.select("#datatable_header").append("div").attr("class", "container").style("width", (all_dates().length * cell_width) + "px").style("margin-left", -(all_dates().length * cell_width - datatable_width) + "px");
    return container.selectAll("div.cell").data(all_dates()).enter().append("div").attr("class", "cell").text(function(d) {
      return d;
    });
  };

  create_data_columns = function(cat_series) {
    var container;
    container = cat_series.append("div").attr("class", "data_cols").append("div").attr("class", "container").style("width", function(d) {
      return (d[freq].data.length * cell_width) + "px";
    }).style("margin-left", function(d) {
      return -(d[freq].data.length * cell_width - datatable_width) + "px";
    });
    return container.selectAll("div.cell").data(function(d) {
      console.log(d);
      return d[freq].data;
    }).enter().append("div").attr("class", "cell").text(function(d) {
      return (+d).toFixed(3);
    });
  };

  create_axis_control = function(cat_series, axis) {
    return cat_series.append("div").attr("class", "" + axis + "_toggle off").text("+").on("click", function(d) {
      var button;
      button = d3.select(this);
      if (button.classed("off")) {
        return add_to_line_chart(d, axis);
      } else {
        return remove_from_line_chart(d, axis);
      }
    });
  };

  create_axis_controls = function(cat_series) {
    return cat_series.call(create_axis_control, "left").call(create_axis_control, "right");
  };

  create_sparklines = function(cat_series) {
    var spark_paths, spark_range;
    spark_paths = cat_series.append("svg").attr("class", "sparkline").attr("height", series_height).attr("width", 150);
    spark_range = $("#sparkline_slider_div").slider("option", "values");
    return draw_sparklines(spark_range, 0);
  };

  create_series_label = function(cat_series) {
    return cat_series.append("div").attr("class", "series_label").style("line-height", series_height + "px").append("span").text(function(d) {
      return d.display_name;
    });
  };

  series_row_class = function(d) {
    var child_class, parent_class;
    child_class = d.series_parent !== "" ? " child child_of_" + (series_to_class(d.series_parent)) : "";
    parent_class = d.children_sum ? " parent" : "";
    return "series" + child_class + parent_class;
  };

  create_series_rows = function(cat_divs) {
    var cat_series;
    cat_series = cat_divs.selectAll("div.series").data(function(d) {
      return flatten(d.series_list);
    }).enter().append("div").attr("id", function(d) {
      return "s_row_" + (series_to_class(d.udaman_name));
    }).attr("class", series_row_class).attr("state", "expanded").style("height", series_height + "px").on("mouseover", mouseover_series).on("mouseout", mouseout_series).on("click", click_series);
    return cat_series.call(create_series_label).call(create_sparklines).call(create_axis_controls).call(create_data_columns);
  };

  window.create_data_table = function(page_data) {
    var cat_divs, cat_labels;
    populate_dates();
    cat_divs = d3.select("#series_display").selectAll("div.category").data(page_data.series_groups).enter().append("div").attr("class", "category");
    cat_labels = cat_divs.append("div").attr("class", "cat_label").attr("id", function(d) {
      return "cat_" + (series_to_class(d.group_name));
    }).attr("state", "expanded").text(function(d) {
      return d.group_name;
    }).on("mouseover", function(d) {
      return d3.select(this).style("background-color", "#999");
    }).on("mouseout", function(d) {
      return d3.selectAll('.cat_label').style("background-color", "#FFF");
    }).on("click", click_cat);
    return create_series_rows(cat_divs);
  };

}).call(this);
