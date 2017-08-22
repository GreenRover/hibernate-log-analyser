select
  *
from
  Massnahme massnahme0_
  inner join Fall fall1_ on massnahme0_.FALL_ID = fall1_.ID
where
  fall1_.ID in (2195002840931);

/*
1109518 ns acquiring 1 JDBC connections;
48017 ns releasing 1 JDBC connections;
296899 ns preparing 12 JDBC statements;
23594942 ns executing 12 JDBC statements;
0 ns executing 0 JDBC batches;
0 ns performing 0 L2C puts;
0 ns performing 0 L2C hits;
0 ns performing 0 L2C misses;
15878164 ns executing 5 flushes (flushing a total of 29 entities and 69 collections);
13195 ns executing 3 partial-flushes (flushing a total of 0 entities and 0 collections)
*/

select
  *
from
  Massnahme massnahme0_
  inner join Fall fall1_ on massnahme0_.FALL_ID = fall1_.ID
where
  fall1_.ID in (2195002840931);