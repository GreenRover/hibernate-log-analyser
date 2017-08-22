select
  *
from
  ANFRAGE aa0_
  left outer join ANFRAGE_TYP at1_ on anfrage0_.TYP_ID = at1_.ID
  left outer join fooo foo2_ on anfrage0_.FOO_ID = foo2_.ID
where
  anfrage7_.XX = 2166
  and anfrage0_.ZZ = 15340
  and anfrage7_.ORT = '123-XXYZT-4567-foo'
  and anfrage0_.ZEIT >= TO_TIMESTAMP('2017-08-10 11:21:04', 'YYYY-MM-DD HH24:MI:SS')
  /* Thu Aug 10 11:21:04 CEST 2017 */;