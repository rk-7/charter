import * as d3 from 'd3';

export class ZoomableScatter {
  constructor(
    private readonly data: [number, number, number][],
    private svgElement: SVGSVGElement
  ) {}
  //#region Private properties
  private gDot: d3.Selection<SVGGElement, number, HTMLElement, number[]>;
  private gGrid: d3.Selection<SVGGElement, undefined, HTMLElement, undefined>;
  private x: d3.ScaleLinear<number, number>;
  private y: d3.ScaleLinear<number, number>;
  private z: d3.ScaleOrdinal<number, string>;
  private gx: d3.Selection<SVGGElement, undefined, HTMLElement, undefined>;
  private gy: d3.Selection<SVGGElement, undefined, HTMLElement, undefined>;
  // These are function references. This help us avoid `undefined` value for `this` token.
  private xAxis: (
    g: d3.Selection<SVGGElement, any[], HTMLElement, any>,
    x: any
  ) => any;
  // These are function references. This help us avoid `undefined` value for `this` token.
  private yAxis: (
    g: d3.Selection<SVGGElement, any[], HTMLElement, any>,
    y: any
  ) => any;
  // These are function references. This help us avoid `undefined` value for `this` token.
  private grid: {
    (
      g: d3.Selection<SVGGElement, undefined, SVGElement, undefined>,
      x: d3.ScaleLinear<number, number>,
      y: d3.ScaleLinear<number, number>
    ): any;
    (
      selection: d3.Selection<SVGGElement, undefined, null, undefined>,
      ...args: any[]
    ): void;
  };
  private svg: d3.Selection<SVGSVGElement, undefined, HTMLElement, undefined>;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  //#endregion
  //#region public methods
  public chart(
    width: number,
    height: number
  ): d3.Selection<SVGSVGElement, undefined, HTMLElement, undefined> {
    this.initChart(width, height);
    this.setupSVGAttributes(width, height);
    this.setupGrid();
    this.setupDots();
    this.setupAxisGroups();
    this.setupZoom();
    return this.svg;
  }
  public resetZoom(): void {
    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }
  //#endregion
  //#region Private methods
  private initChart(width: number, height: number): void {
    const k = height / width;
    this.setupXScale(width);

    this.setupYScale(k, height);

    this.setupZScale();

    this.xAxis = (g, x) =>
      g
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisTop(x).ticks(12))
        .call((gx) => gx.select('.domain').attr('display', 'none'));

    this.yAxis = (g, y) =>
      g
        .call(d3.axisRight(y).ticks(12 * k))
        .call((gy) => gy.select('.domain').attr('display', 'none'));

    this.grid = (
      g: d3.Selection<SVGGElement, undefined, SVGElement, undefined>,
      x: d3.ScaleLinear<number, number>,
      y: d3.ScaleLinear<number, number>
    ) => this.gridXY(g, x, y, k, height, width);
  }
  private setupZScale(): void {
    this.z = d3
      .scaleOrdinal<number, string>()
      .domain(this.data.map((d) => d[2]))
      // It just maps it to the colors based on the value in d[2]
      .range(d3.schemeCategory10);
  }

  private setupXScale(width: number): void {
    this.x = d3.scaleLinear().domain([-4.5, 4.5]).range([0, width]);
  }

  private setupYScale(k: number, height: number): void {
    this.y = d3
      .scaleLinear()
      .domain([-4.5 * k, 4.5 * k])
      .range([height, 0]);
  }

  private gridXY(
    g: d3.Selection<SVGGElement, undefined, SVGElement, undefined>,
    x: d3.ScaleLinear<number, number>,
    y: d3.ScaleLinear<number, number>,
    k: number,
    height: number,
    width: number
  ): d3.Selection<SVGGElement, undefined, SVGElement, undefined> {
    return g
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.1)
      .call((gx) => this.updateGridX(gx, x, height))
      .call((gy) => this.updateGridY(gy, y, k, width));
  }
  private updateGridX(
    g: d3.Selection<SVGGElement, undefined, SVGElement, undefined>,
    x: d3.ScaleLinear<number, number>,
    height: number
  ): d3.Selection<
    Element | d3.EnterElement | Window | SVGLineElement,
    number,
    SVGGElement,
    undefined
  > {
    return g
      .selectAll('.x')
      .data(x.ticks(12))
      .join(
        (enter) => enter.append('line').attr('class', 'x').attr('y2', height),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr('x1', (d) => 0.5 + x(d))
      .attr('x2', (d) => 0.5 + x(d));
  }
  private updateGridY(
    g: d3.Selection<SVGGElement, undefined, SVGElement, undefined>,
    y: d3.ScaleLinear<number, number>,
    k: number,
    width: number
  ): d3.Selection<
    Element | d3.EnterElement | Window | SVGLineElement,
    number,
    SVGGElement,
    undefined
  > {
    return g
      .selectAll('.y')
      .data(y.ticks(12 * k))
      .join(
        (enter) => enter.append('line').attr('class', 'y').attr('x2', width),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr('y1', (d) => 0.5 + y(d))
      .attr('y2', (d) => 0.5 + y(d));
  }

  private setupSVGAttributes(width: number, height: number): void {
    this.svg = d3
      .select<SVGSVGElement, undefined>(this.svgElement)
      .attr('viewBox', [0, 0, width, height].join(' '));
  }

  private setupZoom(): void {
    this.zoom = d3
      .zoom()
      .scaleExtent([0.5, 32])
      .on('zoom', ({ transform }) => this.zoomed({ transform }));
    this.svg.call(this.zoom).call(this.zoom.transform, d3.zoomIdentity);
  }

  private setupAxisGroups(): void {
    this.gx = this.svg.append('g');
    this.gy = this.svg.append('g');
  }

  private setupDots(): void {
    this.gDot = this.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round');

    this.gDot
      .selectAll('path')
      .data(this.data)
      .join('path')
      .attr('d', (d) => `M${this.x(d[0])},${this.y(d[1])}h0`)
      .attr('stroke', (d) => this.z(d[2]));
  }

  private setupGrid(): void {
    this.gGrid = this.svg.append('g');
  }

  private zoomed({ transform }): void {
    const zx = transform.rescaleX(this.x).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(this.y).interpolate(d3.interpolateRound);
    this.gDot
      .attr('transform', transform)
      .attr('stroke-width', 5 / transform.k);
    this.gx.call(this.xAxis, zx);
    this.gy.call(this.yAxis, zy);
    this.gGrid.call(this.grid, zx, zy);
  }
  //#region
}
