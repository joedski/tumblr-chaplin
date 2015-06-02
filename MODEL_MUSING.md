Model Musing
============

Posts are always returned most recent first, as is normal for a blog roll.

Even with the request to `/posts`, the blog info returned by `/info` is also included, and this behavior is also pointed out in Tumblr's API docs.  I guess this is so that the posts have the related main blog to point to.  This probably won't be made use of in our thingy past the first time, but the size of that response is insignificant compared to the size of the posts, so it doesn't impact performance too much I think.



Specific Details
----------------

- `notes_info`: Looks like even with `notes_info=false`, (or just leaving the `note_info` param off all together) posts still return the notes count.  Huzzah.



Models
------

### blog

- Key Prop: `name`
- Comparator: none.

#### Relations:

- post: has many

### post

- Key Prop: `id`
- Comparator: Reverse sort by: `timestamp`
	- I think reverse sorts have to be implemented using a `sort(a,b)` type comparator.

#### Relations:

- blog: has one
	- prop name: `blog_name`
