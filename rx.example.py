import rx
from rx import operators as ops
from time import sleep

source = rx.subject.Subject()
composed = source.pipe(
    ops.buffer_with_time(2.0)
)
composed.subscribe(lambda value: print(value))

for line in [1,2,3]:
    source.on_next(line)

sleep(5)