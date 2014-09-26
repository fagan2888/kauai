(function() {
  var all_dates, dates_extent, slider_dates, slider_extent;

  slider_extent = null;

  window.add_to_pie = function(series) {
    return console.log("sending to right");
  };

  window.remove_from_pie = function(series) {
    return console.log("removing from left");
  };

  all_dates = function() {
    return d3.select("#time_slice_slider_div").datum();
  };

  dates_extent = function(extent) {
    return all_dates().slice(extent[0], extent[1] + 1);
  };

  slider_dates = function() {
    var extent;
    extent = slider_extent;
    return dates_extent(extent);
  };

  window.redraw_slice = function(event, ui) {
    slider_extent = ui.values;
    return d3.select("#slice_slider_selection").text(all_dates()[slider_extent[1]]);
  };

  window.visitor_pie_chart = function(container) {
    var center_x, center_y, chart_area, color, pie_arc, pie_data, pie_layout, svg;
    svg = set_up_svg(container);
    color = d3.scale.category20c();
    center_x = svg.attr("width") / 2;
    center_y = svg.attr("height") / 2;
    pie_layout = d3.layout.pie().value(function(d) {
      return d.val;
    });
    pie_arc = d3.svg.arc().outerRadius(100).innerRadius(0);
    chart_area = svg.append("g").attr("id", "pie_chart_area").attr("transform", "translate(" + center_x + "," + center_y + ")");
    pie_data = ["VISUSW", "VISUSE", "VISJP", "VISCAN"].map(function(d) {
      var data_point;
      data_point = ts_annual["" + d + "@KAU.A"].data.filter(function(d) {
        return +d.period === 2013;
      })[0].val;
      return {
        val: +data_point,
        s_name: d
      };
    });
    svg.append("text").attr("id", "slice_slider_selection").attr("text-anchor", "middle").attr("x", center_x).attr("y", svg.attr("height") - 10).text("2013");
    return chart_area.selectAll("path").data(pie_layout(pie_data)).enter().append("path").attr("d", pie_arc).attr("fill", function(d) {
      return color(d.data.s_name);
    }).attr("stroke", "white").attr("stroke-width", 2).on("mouseover", function(d, i) {
      var slice;
      slice = d3.select(this);
      slice.attr("fill-opacity", ".3");
      return chart_area.append("text").attr("class", "pie_label").attr("text-anchor", "middle").attr("transform", "translate( " + (pie_arc.centroid(d)) + " )").text(d.data.s_name);
    }).on("mouseout", function(d) {
      var slice;
      slice = d3.select(this);
      slice.attr("fill-opacity", "1");
      return chart_area.select("text.pie_label").remove();
    });
  };

}).call(this);
