---
---
slider_extent = null

x_from_slider = (d,i) ->
  x(all_dates()[slider_extent[0] + i])
  
#---- Line Chart variables ---------

y_left = d3.scale.linear()
y_right = d3.scale.linear()
x = d3.scale.ordinal()
window.x_scale = x  
y =
  left:
    class:"s_left"
    scale: y_left 
    axis: d3.svg.axis().scale(y_left).orient("left")
    path: d3.svg.line()
            .x(x_from_slider)
            .y((d) -> y_left(d))
            .defined((d) -> d isnt null)
  right:
    class:"s_right"
    scale: y_right
    axis: d3.svg.axis().scale(y_right).orient("right")
    path: d3.svg.line()
            .x(x_from_slider)
            .y((d) -> y_right(d))
            .defined((d) -> d isnt null)
    

time_axis = d3.svg.axis().scale(x)

dummy_path = d3.svg.line()
  .x(x_from_slider)
  .y(0)
  .defined((d) -> d isnt null)

# ------------------------------------


all_dates = ->
  d3.select("#line_chart_slider_div").datum()
    
dates_extent = (extent) ->
  all_dates().slice(extent[0], extent[1]+1)

slider_dates = ->
  extent = slider_extent
  dates_extent(extent)
  
  
chart_extent = (array) ->
  full_extent = d3.extent(array)
  range = full_extent[1] - full_extent[0]
  [
    full_extent[0] - range*.1
    full_extent[1] + range*.1
  ]

combine_extent = (ex1, ex2) ->
  [ d3.min([ex1[0],ex2[0]]), d3.max([ex1[1],ex2[1]]) ]


toggle_axis_button = (series, axis) ->
  button = d3.select("#s_row_#{series_to_class(series)} .#{axis}_toggle")
  if button.classed("off")
    button.text("-").attr("class", "#{axis}_toggle on")
  else
    button.text("+").attr("class", "#{axis}_toggle off")

trim_d = (d, extent) ->
  d.trimmed_data = d.data.slice(extent[0], extent[1]+1)

adjust_x_axis_labels = (text_elements) ->
  text_elements
    .attr("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr('dy', ".20em")
    .attr("transform", (d) -> "rotate(-65)")

update_x_domain = (extent, duration=0) ->
  x.domain(dates_extent(extent))

  d3.select("#time_axis")
    .transition()
    .duration(duration)
    .call(time_axis)
    .selectAll("text")
    .call(adjust_x_axis_labels)

update_domain = (axis, duration = 500) ->
  data = d3.select("g#chart_area").selectAll(".#{y[axis].class}").data().map((d) -> d[freq].trimmed_data)

  if data.length == 0
    y[axis].scale.domain([0,1])
  else
    all_data = []
    all_data = all_data.concat(series) for series in data
    y[axis].scale.domain(chart_extent(all_data))

  d3.select("##{axis}_axis")
    .transition()
    .duration(duration)
    .call(y[axis].axis)

update_y_domain_with_new = (axis, domain, duration = 500) ->
  cur_domain = y[axis].scale.domain()
  
  unless d3.select("g#chart_area").selectAll("path."+y[axis].class).empty()
    domain = combine_extent(cur_domain, domain)
  
  y[axis].scale.domain(domain).nice()
  
  d3.select("##{axis}_axis")
    .transition()
    .duration(duration)
    .call(y[axis].axis)

  
redraw_line_chart = (extent, duration = 0) ->
  dates = d3.select("#line_chart_slider_div").datum()
  update_x_domain(extent)

  paths = d3.select("g#chart_area")
    .selectAll("path")
    .attr("d", (d) -> 
      trim_d d[freq], extent
      y["left"].path(d[freq].trimmed_data)
    )
    
window.trim_time_series = (event, ui) ->
  slider_extent = ui.values
  redraw_line_chart(slider_extent)

window.add_to_line_chart = (d, axis) ->
  console.log(d[freq].yoy)
  duration = 500
  trim_d d[freq], slider_extent
  domain = chart_extent(d[freq].trimmed_data)  
  
  update_y_domain_with_new(axis, domain, duration)
  
  d3.select("g#chart_area").append("path")
    .datum(d)
    .attr("id", y[axis].class + "_#{series_to_class(d.udaman_name)}")
    .attr("class", "#{y[axis].class} line_chart_path")
    .attr("stroke", "#777")
    .attr("d", (d) -> dummy_path(d[freq].trimmed_data))
    
  d3.select("g#chart_area").selectAll("path.#{y[axis].class}")
    .transition()
    .duration(duration)
    .attr("d", (d) -> y[axis].path(d[freq].trimmed_data))
  
  toggle_axis_button(d.udaman_name, axis)


window.remove_from_line_chart = (d, axis) ->
  duration = 500
  chart_area = d3.select("g#chart_area")  
  d3.select("#s_#{axis}_#{series_to_class(d.udaman_name)}").remove()

  update_domain(axis, duration)

  chart_area.selectAll("path.#{y[axis].class}")
    .transition()
    .duration(duration)
    .attr("d", (d) -> y[axis].path(d[freq].trimmed_data))

  toggle_axis_button(d.udaman_name, axis)

  
window.line_chart = (container) ->
  svg = set_up_svg(container)
  margin = 
    top: 10
    bottom: 75
    left: 50
    right: 50

  chart_area_width = svg.attr("width") - margin.left-margin.right
  chart_area_height = svg.attr("height") - margin.top - margin.bottom

  slider_extent = [0, all_dates().length]
  update_x_domain(slider_extent)
  x.rangePoints([0, chart_area_width])
  y.left.scale.range([chart_area_height,0])
  y.right.scale.range([chart_area_height,0])

  svg.append("g")
    .attr("id", "time_axis")
    .attr("transform", "translate(#{margin.left},#{margin.top+chart_area_height})")
    .call(time_axis)
    .selectAll("text")
    .call(adjust_x_axis_labels)

  svg.append("g")
    .attr("id", "left_axis")
    .attr("transform", "translate(#{margin.left},#{margin.top})")
    .call(y.left.axis)
  
  svg.append("g")
    .attr("id", "right_axis")
    .attr("transform", "translate(#{margin.left+chart_area_width},#{margin.top})")
    .call(y.right.axis)

  chart_area = svg.append("g")
    .attr("id", "chart_area")
    .attr("transform", "translate(#{margin.left},#{margin.top})")