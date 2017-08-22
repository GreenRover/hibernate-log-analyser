/* select m from xxx.model.Massnahme as m inner join m.fall as f where f.id IN (:fallIds) */
select
  *
from
  Massnahme massnahme0_
  inner join Fall fall1_ on massnahme0_.FALL_ID = fall1_.ID
where
  fall1_.ID in (2195002840931);

select
  *
from
  Massnahme massnahme0_
  inner join Fall fall1_ on massnahme0_.FALL_ID = fall1_.ID
where
  fall1_.ID in (2195002840931);