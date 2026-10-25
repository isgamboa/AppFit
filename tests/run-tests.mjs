import {spawnSync} from 'node:child_process';
const suites=['custom-programs','daily-substitutions','seeded-programs','activities-and-removals','program-cycles','cycle-migration','legacy-backup-roundtrip','standard-data','endomonster','protocol-black'];
for(const name of suites){
 console.log(`\n${name}`);
 const result=spawnSync(process.execPath,[`tests/${name}.mjs`],{stdio:'inherit'});
 if(result.error){console.error(result.error);process.exit(1);}
 if(result.status!==0)process.exit(result.status||1);
}
