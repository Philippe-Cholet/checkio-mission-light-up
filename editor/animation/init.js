//Dont change it
requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $) {
        function lightUpCanvas(dom, input, data) {

            if (! data || ! data.ext) {
                return
            }

            $(dom.parentNode).find(".answer").remove()
            
            const result = data.ext.result
            const output = data.out
            const result_addon_01 = data.ext.result_addon[1]

            if (input[0].length >= 50) {
                return
            }

            const attr = {
                grid: {
                    empty: {
                        'stroke': '#2080B8',
                    },
                    block: {
                        'stroke': '#2080B8',
                        'fill': '#8FC7ED',
                    },
                },
                number: {
                    'font-family': 'serif',
                    'font-weight': 'bold',
                    'fill': '#163e69',
                },
                light: {
                    'fill': 'orange',
                },
                ray: {
                    'stroke': '#faba00',
                },
            }

            /*----------------------------------------------*
             *
             * paper
             *
             *----------------------------------------------*/
            const width = input[0].length
            const height = input.length


            let max_width = 350
            const os = 10
            const SIZE = (max_width - os*2) / Math.max(4, width)
            max_width = Math.min(350, SIZE*width+os*2)
            const paper = Raphael(dom, max_width, SIZE*height+os*2, 0, 0)

            /*----------------------------------------------*
             *
             * svg
             *
             *----------------------------------------------*/
            const lamp = [
                "M256,0c-79.391,0-143.75,64.344-143.75,143.75c0,33.828,11.688,64.922,31.25,89.484 c26.328,33.063,40.234,46.234,40.234,84.766c0,17.672,8.031,25.703,20.875,25.703h102.781c12.859,0,20.891-8.031,20.891-25.703 c0-38.531,13.891-51.703,40.219-84.766c19.563-24.563,31.25-55.656,31.25-89.484C399.75,64.344,335.391,0,256,0z",
                "M256,512c17.797,0,32.219-14.422,32.219-32.219h-64.438C223.781,497.578,238.203,512,256,512z",
                "M311.25,366.219h-110.5c-9.594,0-17.375,7.781-17.375,17.375c0,9.609,7.781,17.391,17.375,17.391h110.5 c9.594,0,17.391-7.781,17.391-17.391C328.641,374,320.844,366.219,311.25,366.219z",
                "M311.25,422.344h-110.5c-9.594,0-17.375,7.797-17.375,17.406c0,9.594,7.781,17.375,17.375,17.375h110.5 c9.594,0,17.391-7.781,17.391-17.375C328.641,430.141,320.844,422.344,311.25,422.344z"
            ]

            /*----------------------------------------------*
             *
             * making block dictionary
             *
             *----------------------------------------------*/
            const blocks = {}
            for (let r = 0; r < height; r += 1) {
                for (let c = 0; c < width; c += 1) {
                    if (input[r][c] !== ' ') {
                        blocks[r*100+c] = 1
                    }
                }
            }

            /*----------------------------------------------*
             *
             * draw ray and lamps
             *
             *----------------------------------------------*/
            const SCALE = 15 * (width/7)

            if (result_addon_01 === 'Valid') {

              // ray
              output.forEach(lp=>{
                const [y, x] = lp

                // search block
                // 1: to top
                let top = y
                for (let r = y-1; r >= 0 && ! blocks[r*100+x]; r -= 1) {
                    top = r
                }
                // 2: to bottom
                let bottom = y
                for (let r = y+1; r < height && ! blocks[r*100+x]; r += 1) {
                    bottom = r
                }
                // 3: to left
                let left = x
                for (let c = x-1; c >= 0 && ! blocks[y*100+c]; c -= 1) {
                    left = c
                }
                // 4: to right
                let right = x
                for (let c = x+1; c < width && ! blocks[y*100+c]; c += 1) {
                    right = c
                }

                if (! blocks[y*100+x]) {
                  const v_ray = paper.path(['M', x*SIZE+os+SIZE/2, 
                    top*SIZE+os, 'L', x*SIZE+os+SIZE/2, 
                    (bottom+1)*SIZE+os].join(' '))
                  v_ray.attr({'stroke-width': 38/(width/7)}).attr(attr.ray)

                  const h_ray = paper.path(['M', left*SIZE+os, 
                    y*SIZE+os+SIZE/2,
                    'L', (right+1)*SIZE+os, y*SIZE+os+SIZE/2].join(' '))
                  h_ray.attr({'stroke-width': 38/(width/7)}).attr(attr.ray)
                }
              })

              // lamp
              output.forEach(lp=>{
                const [y, x] = lp
                const path
                    = paper.path(lamp.join(' ')).translate(-246, -246)
                path.scale(1/SCALE).translate(SIZE/2*SCALE, SIZE/2*SCALE)
                path.translate(x*SIZE*SCALE, y*SIZE*SCALE)
                path.attr({'stroke-width': 1/(width/7)}).attr(attr.light)
              })
            }

            /*----------------------------------------------*
             *
             * draw grid
             *
             *----------------------------------------------*/
            for (let r = 0; r < height; r += 1) {
                for (let c = 0; c < width; c += 1) {
                    if (input[r][c] === ' ') {
                        paper.rect(SIZE*c+os, SIZE*r+os, SIZE, SIZE).attr(
                            attr.grid.empty)
                    } else {
                        paper.rect(SIZE*c+os, SIZE*r+os, SIZE, SIZE).attr(
                            attr.grid.block)
                        if (! isNaN(input[r][c])) {
                            const num = paper.text(SIZE*c+os+SIZE*.5, 
                                SIZE*r+os+SIZE*.5, input[r][c])
                            num.attr({'font-size': 200/width}).attr(
                                attr.number)
                        }
                    }
                }
            }
        }

        var $tryit;

        var io = new extIO({
            multipleArguments: false,
            functions: {
                python: 'light_up',
                //js: 'lightUp'
            },
            animation: function($expl, data){
                lightUpCanvas(
                    $expl[0],
                    data.in,
                    data,
                );
            }
        });
        io.start();
    }
);
