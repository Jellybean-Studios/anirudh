# Game sources

Updated October 20, 2026. The arcade contains 66 games: 50 public GameMonetize players, 13 original or MIT-licensed locally hosted classics, and the three existing Drift Boss / Escape Road 1 / Escape Road 2 players. Escape Road 3 has been removed.

## Distributor games

The [official RSS builder](https://gamemonetize.com/rss-builder) supplies games for embedding on publisher websites. The [publisher FAQ](https://gamemonetize.com/faq) describes this integration. Game code and SDKs are loaded from the distributor without modification. The cover images are copied from the provided thumbnail URLs; game names and artwork belong to their respective owners.

Source feeds:

- https://gamemonetize.com/rssfeed.php?format=json&category=All&type=html5&popularity=mostplayed&company=All&amount=100
- https://gamemonetize.com/rssfeed.php?format=json&category=All&type=html5&popularity=bestgames&company=All&amount=100

Each selected player returned HTTP 200 without blocking frame headers, and each cover was verified as an image. Browser smoke tests are sampled; these checks do not guarantee game-server availability or school-network access.

| Game | Public player | Cover source |
| --- | --- | --- |
| Hero Rescue Puzzle | [Player](https://html5.gamemonetize.co/3596x93682lmj4cn7mrtldmfhviig7jj/) | [Cover](https://img.gamemonetize.com/3596x93682lmj4cn7mrtldmfhviig7jj/512x384.jpg) |
| Love Balls 2D | [Player](https://html5.gamemonetize.co/1l6pgl750zi41o2cktmkmr71dntshaej/) | [Cover](https://img.gamemonetize.com/1l6pgl750zi41o2cktmkmr71dntshaej/512x384.jpg) |
| Happy Glass : Fill the Glass by Draw Lines | [Player](https://html5.gamemonetize.co/dayksem3hjbea9vsbklh6wqi213w9121/) | [Cover](https://img.gamemonetize.com/dayksem3hjbea9vsbklh6wqi213w9121/512x384.jpg) |
| Roof Rails - Color Stack 3D | [Player](https://html5.gamemonetize.co/3zsuu4fl12ujvfaa5yett2t1rclzg9jj/) | [Cover](https://img.gamemonetize.com/3zsuu4fl12ujvfaa5yett2t1rclzg9jj/512x384.jpg) |
| Bike Race Rush | [Player](https://html5.gamemonetize.co/4bb52narsr9s57z5y7qlch5zhupiucld/) | [Cover](https://img.gamemonetize.com/4bb52narsr9s57z5y7qlch5zhupiucld/512x384.jpg) |
| Fall Bros | [Player](https://html5.gamemonetize.co/vnvpo9h7zc6phugavlw7xni2thz4no4i/) | [Cover](https://img.gamemonetize.com/vnvpo9h7zc6phugavlw7xni2thz4no4i/512x384.jpg) |
| Skate Hooligans | [Player](https://html5.gamemonetize.co/vy07es6s71vci1su3wzcqrp7e3ym0vtw/) | [Cover](https://img.gamemonetize.com/vy07es6s71vci1su3wzcqrp7e3ym0vtw/512x384.jpg) |
| 12 MiniBattles | [Player](https://html5.gamemonetize.co/nuiyi3o2g6fktyjda55g42v3qe5a3hbq/) | [Cover](https://img.gamemonetize.com/nuiyi3o2g6fktyjda55g42v3qe5a3hbq/512x384.jpg) |
| Save The Girl Epic | [Player](https://html5.gamemonetize.co/9ytk0fr25q0r20zbb524x4bxcvpnm5gw/) | [Cover](https://img.gamemonetize.com/9ytk0fr25q0r20zbb524x4bxcvpnm5gw/512x384.jpg) |
| Pull Him Out Online | [Player](https://html5.gamemonetize.co/mhqkw9a80at8pnqcc6jj2uiii5chfai1/) | [Cover](https://img.gamemonetize.com/mhqkw9a80at8pnqcc6jj2uiii5chfai1/512x384.jpg) |
| Hero Rescue | [Player](https://html5.gamemonetize.co/zgkwaeh6phua8b460eg2j70sm5dixkjx/) | [Cover](https://img.gamemonetize.com/zgkwaeh6phua8b460eg2j70sm5dixkjx/512x384.jpg) |
| Russian Taz Driving 2 | [Player](https://html5.gamemonetize.co/ulqp6jflm90q0hrtvsjtna5zdjocfic9/) | [Cover](https://img.gamemonetize.com/ulqp6jflm90q0hrtvsjtna5zdjocfic9/512x384.jpg) |
| Pop It Now | [Player](https://html5.gamemonetize.co/60h28crzdjt3ldx00w5usnexf21pod74/) | [Cover](https://img.gamemonetize.com/60h28crzdjt3ldx00w5usnexf21pod74/512x384.jpg) |
| Elastic Man | [Player](https://html5.gamemonetize.co/w4ytwq2s6jdvmkp8tzplxo8jphjsvuxr/) | [Cover](https://img.gamemonetize.com/w4ytwq2s6jdvmkp8tzplxo8jphjsvuxr/512x384.jpg) |
| Red Ball Forever 2 | [Player](https://html5.gamemonetize.co/xvgxy279mumukqpyzmvgwn8x1cw7g9cd/) | [Cover](https://img.gamemonetize.com/xvgxy279mumukqpyzmvgwn8x1cw7g9cd/512x384.jpg) |
| Dune Surfer 3d | [Player](https://html5.gamemonetize.co/gbql8397haa6gwa3a1h6nqopiwsr0s0g/) | [Cover](https://img.gamemonetize.com/gbql8397haa6gwa3a1h6nqopiwsr0s0g/512x384.jpg) |
| Golf Battle | [Player](https://html5.gamemonetize.co/w0ij1igcyt8yd96ppelksxcwulp0inye/) | [Cover](https://img.gamemonetize.com/w0ij1igcyt8yd96ppelksxcwulp0inye/512x384.jpg) |
| Mini Switcher | [Player](https://html5.gamemonetize.co/r822rwum14259b7wacvt1acbp3e4jv4a/) | [Cover](https://img.gamemonetize.com/r822rwum14259b7wacvt1acbp3e4jv4a/512x384.jpg) |
| Golf king 3D | [Player](https://html5.gamemonetize.co/5jvtch06tn67htxzd4x6brzo20pmdyjb/) | [Cover](https://img.gamemonetize.com/5jvtch06tn67htxzd4x6brzo20pmdyjb/512x384.jpg) |
| Save the Kitten | [Player](https://html5.gamemonetize.co/t4v0qrawern26uvsty9514lwespe8e8r/) | [Cover](https://img.gamemonetize.com/t4v0qrawern26uvsty9514lwespe8e8r/512x384.jpg) |
| Ultimate Flying Car | [Player](https://html5.gamemonetize.co/yqbipdebtjz8q97zamh7utwjdrs1bh1e/) | [Cover](https://img.gamemonetize.com/yqbipdebtjz8q97zamh7utwjdrs1bh1e/512x384.jpg) |
| Relic Runway | [Player](https://html5.gamemonetize.co/ralnzjj3b624rjg6a31vl3m7tz7p8tf0/) | [Cover](https://img.gamemonetize.com/ralnzjj3b624rjg6a31vl3m7tz7p8tf0/512x384.jpg) |
| Car Eats Car: Dungeon Adventure | [Player](https://html5.gamemonetize.co/2ysdz38kvh0t5zfu64oew4wzbbginajp/) | [Cover](https://img.gamemonetize.com/2ysdz38kvh0t5zfu64oew4wzbbginajp/512x384.jpg) |
| Correct Math | [Player](https://html5.gamemonetize.co/nk8ecy4vj5jc8u7271mx9v9aptpbdn41/) | [Cover](https://img.gamemonetize.com/nk8ecy4vj5jc8u7271mx9v9aptpbdn41/512x384.jpg) |
| Zumba Mania | [Player](https://html5.gamemonetize.co/03yns70hfztn5480rjr3pfrg55z22e23/) | [Cover](https://img.gamemonetize.com/03yns70hfztn5480rjr3pfrg55z22e23/512x384.jpg) |
| Cyber Truck Drive Simulator | [Player](https://html5.gamemonetize.co/7xk1ek5ya108fojn7b3df0ajdx2k5jhc/) | [Cover](https://img.gamemonetize.com/7xk1ek5ya108fojn7b3df0ajdx2k5jhc/512x384.jpg) |
| Brain Test: IQ Challenge | [Player](https://html5.gamemonetize.co/893dmia83svuj6rwn19tx03ubpe32a9o/) | [Cover](https://img.gamemonetize.com/893dmia83svuj6rwn19tx03ubpe32a9o/512x384.jpg) |
| Mad Day Special | [Player](https://html5.gamemonetize.co/x1pcf3eqnaqhacegno3gkgidfsbz7us4/) | [Cover](https://img.gamemonetize.com/x1pcf3eqnaqhacegno3gkgidfsbz7us4/512x384.jpg) |
| Temple Quest | [Player](https://html5.gamemonetize.co/wfpm0h4x8a3f63snpkqvfp3b7mhx9z25/) | [Cover](https://img.gamemonetize.com/wfpm0h4x8a3f63snpkqvfp3b7mhx9z25/512x384.jpg) |
| Brazen Ball | [Player](https://html5.gamemonetize.co/ng1cndnhqyt5r986yphveujeapfk5sca/) | [Cover](https://img.gamemonetize.com/ng1cndnhqyt5r986yphveujeapfk5sca/512x384.jpg) |
| Call of Tanks | [Player](https://html5.gamemonetize.co/r6s0bryt2olvq34tsbk58etrr7h7ajg2/) | [Cover](https://img.gamemonetize.com/r6s0bryt2olvq34tsbk58etrr7h7ajg2/512x384.jpg) |
| Car Eats Car 3D | [Player](https://html5.gamemonetize.co/zmhg27l34xg8odt4m6evz9q7gh5be4v3/) | [Cover](https://img.gamemonetize.com/zmhg27l34xg8odt4m6evz9q7gh5be4v3/512x384.jpg) |
| Go Find The Cake | [Player](https://html5.gamemonetize.co/fhnhmpds48vhpobpgl2hpdtb07mf7s9v/) | [Cover](https://img.gamemonetize.com/fhnhmpds48vhpobpgl2hpdtb07mf7s9v/512x384.jpg) |
| PondHero | [Player](https://html5.gamemonetize.co/i0ls0z1jfyvauimh5g7xlm26r0hjidm0/) | [Cover](https://img.gamemonetize.com/i0ls0z1jfyvauimh5g7xlm26r0hjidm0/512x384.jpg) |
| Worm Puzzle Snake Apple | [Player](https://html5.gamemonetize.co/kgc33h43coc5eau51ex5ishqfy6eg2al/) | [Cover](https://img.gamemonetize.com/kgc33h43coc5eau51ex5ishqfy6eg2al/512x384.jpg) |
| Hedgehog Go Home | [Player](https://html5.gamemonetize.co/ddvwskxiquvo3mxp7jirl9rhtwkjmeb2/) | [Cover](https://img.gamemonetize.com/ddvwskxiquvo3mxp7jirl9rhtwkjmeb2/512x384.jpg) |
| Birdie Bounce | [Player](https://html5.gamemonetize.co/r859o5fks18qjz7vtal0q5sjwchiq73v/) | [Cover](https://img.gamemonetize.com/r859o5fks18qjz7vtal0q5sjwchiq73v/512x384.jpg) |
| Panda Adventure | [Player](https://html5.gamemonetize.co/t9usazpd800zm786qh2g21p0khxjfka7/) | [Cover](https://img.gamemonetize.com/t9usazpd800zm786qh2g21p0khxjfka7/512x384.jpg) |
| Color Snake Run | [Player](https://html5.gamemonetize.co/1y99emuy48db6fj22jllf24fk7apcsta/) | [Cover](https://img.gamemonetize.com/1y99emuy48db6fj22jllf24fk7apcsta/512x384.jpg) |
| Going Rolling Ball | [Player](https://html5.gamemonetize.co/0e2hjszjwju68p8x4fo2rm9ffduzi83v/) | [Cover](https://img.gamemonetize.com/0e2hjszjwju68p8x4fo2rm9ffduzi83v/512x384.jpg) |
| World Archery League | [Player](https://html5.gamemonetize.co/tdcb5hzr1l1cv72zh24mjenpqwpoup7u/) | [Cover](https://img.gamemonetize.com/tdcb5hzr1l1cv72zh24mjenpqwpoup7u/512x384.jpg) |
| Basket Ball For Two Player | [Player](https://html5.gamemonetize.co/b5upjvb40xxim12v4ytzt5naxuu7ps3d/) | [Cover](https://img.gamemonetize.com/b5upjvb40xxim12v4ytzt5naxuu7ps3d/512x384.jpg) |
| Snow Slider 3D | [Player](https://html5.gamemonetize.co/nprefcbbxxogk6wkh85squgc1fdhtxiu/) | [Cover](https://img.gamemonetize.com/nprefcbbxxogk6wkh85squgc1fdhtxiu/512x384.jpg) |
| Neon Velocity | [Player](https://html5.gamemonetize.co/2n7d2035nvye9198r3ua7gzs00gfcgqf/) | [Cover](https://img.gamemonetize.com/2n7d2035nvye9198r3ua7gzs00gfcgqf/512x384.jpg) |
| Mini Pool 3D | [Player](https://html5.gamemonetize.co/ehi2vjrem0ya35imcjiofupvjerb5mhr/) | [Cover](https://img.gamemonetize.com/ehi2vjrem0ya35imcjiofupvjerb5mhr/512x384.jpg) |
| NEON JUMPER | [Player](https://html5.gamemonetize.co/6x0r7yogrupxurjrtw4v8wme2c82of96/) | [Cover](https://img.gamemonetize.com/6x0r7yogrupxurjrtw4v8wme2c82of96/512x384.jpg) |
| Bottle Flip Game | [Player](https://html5.gamemonetize.co/1zbs0j6e29n7jeobrg5ih1g16agjqv7w/) | [Cover](https://img.gamemonetize.com/1zbs0j6e29n7jeobrg5ih1g16agjqv7w/512x384.jpg) |
| Train Puzzle | [Player](https://html5.gamemonetize.co/aefgds3hj4dhx8loletpo7mas4fk248c/) | [Cover](https://img.gamemonetize.com/aefgds3hj4dhx8loletpo7mas4fk248c/512x384.jpg) |
| Car Eats Car: Sea Adventure | [Player](https://html5.gamemonetize.co/eio98g4rp8ec0nj0fpi2n78hhrbun3l1/) | [Cover](https://img.gamemonetize.com/eio98g4rp8ec0nj0fpi2n78hhrbun3l1/512x384.jpg) |
| Car Eats Car: Arctic Adventure | [Player](https://html5.gamemonetize.co/tjfsfsiwef7r77fwey3g68cujt80yg6l/) | [Cover](https://img.gamemonetize.com/tjfsfsiwef7r77fwey3g68cujt80yg6l/512x384.jpg) |

## Local classics

2048 retains Gabriele Cirulli's MIT license and credits in `games/2048/`. Falling Blocks retains Jake Gordon and contributors' MIT license and credits in `games/tetris/`. Other local games and their artwork were originally created for this arcade. All local runtime files are included with their game; none requires an external game server. Their directory URLs and existing browser save keys are retained.

## Existing players

Drift Boss and Escape Road 1 retain the user-provided JasonGamesDev players. Escape Road 2 retains its existing public alternate player. These three entries are otherwise unchanged.

## Validation

All 66 entries have unique IDs and player URLs, valid local covers, and embed mode. All local runtime dependencies exist and JavaScript syntax checks pass. Browser checks covered search (including no Escape Road 3 result), loading all 66 cards, favorite persistence after reload, Snake resume/pause and return-to-arcade controls, and restoring the same 81-cell Minesweeper board after reload. Sampled distributor games Red Ball Forever 2 and Pop It Now reached their start menus. School-network access remains unverified.
