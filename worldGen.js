// Worldgen code

class NoiseGenerator {
    constructor(seed = 0){
        this.seed = seed;
        this.permutation = [];
        for(let i=0;i<256;i++) this.permutation[i]=i;
        for(let i=255;i>0;i--){
            let j=Math.floor(this.random()*(i+1));
            [this.permutation[i], this.permutation[j]]=[this.permutation[j], this.permutation[i]];
        }
        this.permutation=this.permutation.concat(this.permutation);
    }
    random(){ 
        let x = Math.sin(this.seed++) * 10000; 
        return x - Math.floor(x); 
    }
    fade(t){ return t*t*t*(t*(t*6-15)+10); }
    lerp(t,a,b){ return a+t*(b-a); }
    grad(hash,x,y){ let h=hash&3; let u=h<2?x:y; let v=h<2?y:x; return ((h&1)===0?u:-u)+((h&2)===0?v:-v); }
    perlin(x,y){
        let xi=Math.floor(x)&255, yi=Math.floor(y)&255;
        let xf=x-Math.floor(x), yf=y-Math.floor(y);
        let u=this.fade(xf), v=this.fade(yf);
        let aa=this.permutation[this.permutation[xi]+yi];
        let ab=this.permutation[this.permutation[xi]+yi+1];
        let ba=this.permutation[this.permutation[xi+1]+yi];
        let bb=this.permutation[this.permutation[xi+1]+yi+1];
        let x1=this.lerp(u,this.grad(aa,xf,yf),this.grad(ba,xf-1,yf));
        let x2=this.lerp(u,this.grad(ab,xf,yf-1),this.grad(bb,xf-1,yf-1));
        return this.lerp(v,x1,x2);
    }
}

/**
 * Generates a procedural world
 * @param {World} world - The World instance
 * @param {number} maxHeight - Maximum terrain height
 * @param {number} seed - Random seed
 */
function generateWorld(world, maxHeight=16, seed=12345){
    const noiseGen = new NoiseGenerator(seed);

    for(let x=0;x<world.width;x++){
        for(let z=0;z<world.depth;z++){
            // Terrain height using Perlin noise
            let height = Math.floor((noiseGen.perlin(x/10, z/10)+1)/2 * maxHeight);

            for(let y=0;y<=height;y++){
                let blockType = y===height ? "grass" : (y>height-4 ? "dirt" : "stone");
                world.setBlock(x,y,z,blockType);
            }

            // Random trees on grass
            if(Math.random()<0.05 && height>3){
                for(let ty=height+1; ty<=height+3; ty++){
                    world.setBlock(x,ty,z,"wood");
                }
                for(let lx=-1; lx<=1; lx++){
                    for(let lz=-1; lz<=1; lz++){
                        world.setBlock(x+lx,height+4,z+lz,"leaves");
                    }
                }
            }

            // Optional water in low areas
            if(height<5){
                for(let y=height+1; y<=5; y++){
                    world.setBlock(x,y,z,"water");
                }
            }
        }
    }
}

// Export for module usage
if(typeof module !== "undefined"){
    module.exports = { NoiseGenerator, generateWorld };
}
